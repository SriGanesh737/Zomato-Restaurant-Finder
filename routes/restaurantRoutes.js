const express = require('express');
const Restaurant = require('../models/Restaurant'); 
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const AWS = require('aws-sdk');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');


const dotenv = require('dotenv');
dotenv.config();
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});


const rekognition = new AWS.Rekognition();


const upload = multer({ dest: 'uploads/' });

// Get restaurants within 3 km of a given latitude and longitude
router.get('/restaurants/nearby', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  console.log(`Searching for restaurants near ${latitude}, ${longitude}`);

  try {
    const nearbyRestaurants = await Restaurant.find({
      "coordinates.lon_lat": {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], 3 / 6378.1] // 3 km radius
        }
      }
    });

    if (nearbyRestaurants.length === 0) {
      return res.status(404).json({ message: 'No nearby restaurants found' });
    }

    res.json({
      total: nearbyRestaurants.length,
      data: nearbyRestaurants,
    });
  } catch (error) {
    console.error('Error retrieving nearby restaurants:', error);
    res.status(500).json({ message: 'Error retrieving nearby restaurants', error });
  }
});

// Route to get a restaurant by its ID
router.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // modify the visitedCnt (increment by one).

    restaurant.visitedCnt = restaurant.visitedCnt+1;
    await restaurant.save();

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving restaurant', error });
  }
});

// Route to get all restaurants with pagination
router.get('/restaurants', async (req, res) => {
  const { page = 1, limit = 9, search_word, filterByCountry, filterByMinPrice, filterByMaxPrice } = req.query;
  
    try {
      // Build the query object
      let query = {};
  
      // Add filter by country 
      if (filterByCountry) {
        query['location.country'] = new RegExp(filterByCountry, 'i'); // Case-insensitive search in country
      }
  
      // Add search word filters
      if (search_word) {
        query.$or = [
          { name: new RegExp(search_word, 'i') },                   // Case-insensitive search in name
          { cuisines: new RegExp(search_word, 'i') },               // Case-insensitive search in cuisines
          { 'location.city': new RegExp(search_word, 'i') },        // Case-insensitive search in city
          { 'location.location_verbose': new RegExp(search_word, 'i') }, // Case-insensitive search in location_verbose
        ];
      }
  
      // Add price filters
      if (filterByMinPrice || filterByMaxPrice) {
        query.average_cost_for_two = {};
        if (filterByMinPrice) {
          query.average_cost_for_two.$gte = parseInt(filterByMinPrice);
        }
        if (filterByMaxPrice) {
          query.average_cost_for_two.$lte = parseInt(filterByMaxPrice);
        }
      }
  
      const restaurants = await Restaurant.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      const total = await Restaurant.countDocuments(query); // Get total count based on query for pagination info
    
      res.json({
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        data: restaurants
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving restaurants', error });
    }
});

router.post('/search-by-image', upload.single('image'), async (req, res) => {
  const file = req.file;
  const { page = 1, limit = 9 } = req.query; // Default to page 1, 9 items per page

  // Read the image from the file
  const bitmap = fs.readFileSync(file.path);

  const params = {
    Image: {
      Bytes: bitmap
    },
    MaxLabels: 3,
    MinConfidence: 85
  }

  // Detect labels in the image
  rekognition.detectLabels(params, async (err, data) => {
    if (err) {
      console.error('Error detecting labels:', err);
      return res.status(500).json({ message: 'Error detecting labels', error: err });
    }

    const labels = data.Labels.map(label => label.Name);

    console.log('Detected labels:', labels);

    const cuisines = fs.readFileSync('cuisines.json');
    const cuisinesArray = JSON.parse(cuisines);
    const cuisinesString = cuisinesArray.join(',');

    const userMessage = `Based on the following food-related tags: ${labels.join(', ')},
      please suggest the top 5 cuisines that best match these tags 
      from the given list of this cuisines: ${cuisinesString}.   **Just Give direct cuisines separated by ',' and dont give any other explanations**`;

    const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
    const model_id = 'meta.llama3-70b-instruct-v1:0';
    const prompt = `<s>[INST] ${userMessage} [/INST]`;

    const request = {
      prompt,
      max_gen_len: 200,
      temperature: 0.5,
      top_p: 0.9,
    }

    const response = await client.send(
      new InvokeModelCommand({
        contentType: 'application/json',
        body: JSON.stringify(request),
        modelId: model_id,
      }),
    );

    const nativeResponse = JSON.parse(new TextDecoder().decode(response.body));
    const generatedText = nativeResponse.generation;
    const generatedTags = generatedText.split(',');
    console.log('Generated tags:', generatedTags);

    labels.push(...generatedTags.slice(0, 3));
    const modifiedLabels = Array.from(new Set(labels.map(label => label.trim())));

    console.log('Modified labels:', modifiedLabels);

    Restaurant.find({
      cuisines: {
        $in: modifiedLabels.map(label => new RegExp(label, 'i'))
      }
    })
      .skip((page - 1) * limit) // Skip the documents for previous pages
      .limit(parseInt(limit)) // Limit the number of documents returned
      .then(restaurants => {
        console.log("length of restaurants", restaurants.length);
        res.json(restaurants);
      })
      .catch(error => {
        console.error('Error searching restaurants by image labels:', error);
        res.status(500).json({ message: 'Error searching restaurants by image labels', error });
      });
  });
});

module.exports = router;
