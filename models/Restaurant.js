const mongoose = require('mongoose');
const { Schema } = mongoose;

const restaurantSchema = new Schema({
  id: { type: String, index: 'asc', unique: true},
  has_online_delivery: { type: Number },
  photos_url: { type: String },
  url: { type: String },
  price_range: { type: Number },
  user_rating: {
    type: {
      rating_text: { type: String },
      rating_color: { type: String },
      votes: { type: String },
      aggregate_rating: { type: String }
    }
  },
  name: { type: String },
  cuisines: { type: String },
  is_delivering_now: { type: Number },
  deeplink: { type: String },
  menu_url: { type: String },
  average_cost_for_two: { type: Number },
  book_url: { type: String },
  switch_to_order_menu: { type: Number },
  has_table_booking: { type: Number },
  location:{
    type: {
      address: { type: String },
      city: { type: String },
      location_verbose: { type: String },
      city_id: { type: Number },
      zipcode: { type: String },
      locality: { type: String },
      country:{type: String},
    }
  },
  coordinates: {
    type: { 
      type: String,
      enum: ['Point'],
      required: true
    },
    lon_lat: { type: [Number], required: true, },
  },
  visitedCnt:{
    type: Number,
    default: 0
  },
  featured_image: { type: String },
  currency: { type: String },
  thumb: { type: String }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
