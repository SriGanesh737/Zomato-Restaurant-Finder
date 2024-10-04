import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tag, Rate, Button, Spin, Alert } from 'antd';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/restaurants/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setRestaurant(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching restaurant details:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Spin size="large" className="flex justify-center items-center h-screen" />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon className="max-w-lg mx-auto mt-8" />;

  return (
    <div className="relative bg-gradient-to-br from-purple-200 via-pink-100 to-red-200 min-h-screen flex flex-col justify-center items-center py-12">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 opacity-30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 opacity-30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500 opacity-30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative p-8 max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl">
        <h1 className="text-5xl font-extrabold text-center mb-8 text-indigo-600">{restaurant.name}</h1>

        <div className="w-full h-[400px] mb-8 rounded-lg overflow-hidden shadow-lg">
          <img
            src={restaurant.featured_image}
            alt={restaurant.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-12 bg-gray-50 p-6 rounded-lg shadow-inner">
          <div className="flex-1 mb-4 md:mb-0">
            <p className="text-xl mb-4 text-gray-700"><strong className="text-gray-900">Address:</strong> {restaurant.location.address}, {restaurant.location.city}</p>
            <p className="text-xl mb-4 text-gray-700"><strong className="text-gray-900">Phone:</strong> {restaurant.phone || 'N/A'}</p>
            <p className="text-xl mb-4 text-gray-700"><strong className="text-gray-900">Cuisines:</strong> {restaurant.cuisines}</p>
          </div>
          <div className="flex-1">
            <p className="text-xl mb-4 text-gray-700"><strong className="text-gray-900">Average Cost for Two:</strong> 
              <span className="text-green-600"> {restaurant.currency} {restaurant.average_cost_for_two}</span>
            </p>
            <p className="text-xl mb-4 text-gray-700"><strong className="text-gray-900">Rating:</strong> 
              <span className="ml-2">
                <Rate allowHalf disabled defaultValue={parseFloat(restaurant.user_rating.aggregate_rating)} />
              </span>
              <span className="ml-2 text-gray-600">({restaurant.user_rating.votes} votes)</span>
            </p>
            <p className="text-xl mb-4 text-gray-700"><strong className="text-gray-900">Delivery:</strong> 
              <Tag color={restaurant.is_delivering_now ? 'green' : 'red'} className="ml-2 text-lg">
                {restaurant.is_delivering_now ? 'Delivering Now' : 'Not Delivering'}
              </Tag>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button 
            type="primary" 
            href={restaurant.menu_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mb-1 text-lg px-6 py-3 font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-transform transform hover:scale-105"
          >
            View Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
