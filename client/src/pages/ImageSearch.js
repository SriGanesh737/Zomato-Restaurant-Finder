import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Spin, Pagination } from 'antd';

const ImageSearch = () => {
  const [image, setImage] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const searchRestaurants = () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    fetch(`http://localhost:5000/api/search-by-image?page=${page}&limit=${limit}`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error searching restaurants by image:', error);
        setLoading(false);
      });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    searchRestaurants();
  };

  return (
    <div className="p-8 bg-gradient-to-r from-purple-200 to-indigo-400 min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-black mb-6">Search by Image</h1>
      
      <input
        type="file"
        onChange={handleImageUpload}
        className="border p-2 bg-white text-gray-800 rounded-lg mb-4 cursor-pointer"
      />
      
      <button
        onClick={searchRestaurants}
        className="bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-pink-700 transition duration-300"
      >
        Search
      </button>

      {loading ? (
        <div className="mt-10">
          <Spin size="large" tip="Searching for restaurants..." />
        </div>
      ) : (
        <>
          <div className='restaurant-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 mt-6 w-full'>
            {
              restaurants === undefined || restaurants.length === 0 ? (
                <h2 className="text-white text-xl col-span-full text-center">No restaurants found</h2>
              ) : (
                restaurants.map(restaurant => (
                  <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="hover:scale-105 transform transition duration-300">
                    <Card
                      hoverable
                      style={{
                        width: '100%',
                        height: '350px',
                        border: '2px solid #e8e8e8',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div className='thumb-image w-full h-[200px] rounded-t-xl overflow-hidden'>
                        <img className='w-full h-full object-cover' src={restaurant.thumb} alt={restaurant.name} />
                      </div>
                      <div className='p-4'>
                        <h2 style={{ fontFamily: "Montserrat" }} className='text-2xl font-bold mb-2 text-purple-800'>{restaurant.name}</h2>
                        <div className='flex justify-between items-center mb-2'>
                          <p className='text-gray-700 text-sm font-open-sans'>
                            <span className='font-bold text-black mr-1'>Avg Cost for Two:</span>
                            <span className='text-green-600'>{restaurant.currency} {restaurant.average_cost_for_two}</span>
                          </p>
                          <p className={`text-sm font-bold ${restaurant.user_rating.aggregate_rating >= 4.5
                            ? 'text-green-500'
                            : restaurant.user_rating.aggregate_rating >= 3.0
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}>
                            Rating: {restaurant.user_rating.aggregate_rating}
                            <span className='text-gray-600 font-medium'> ({restaurant.user_rating.votes} votes)</span>
                          </p>
                        </div>
                        <p className='text-gray-700'>
                          {restaurant.location.address}, <span className='text-blue-500'>{restaurant.location.city}</span>
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))
              )
            }
          </div>
          <Pagination
            current={page}
            pageSize={limit}
            pageSizeOptions={[9, 18, 30]}
            onChange={handlePageChange}
            total={100} 
            className="mt-8"
          />
        </>
      )}
    </div>
  );
};

export default ImageSearch;
