import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from 'antd';
import { Card, Input } from 'antd';
import { Button, Tooltip } from 'antd';
import { CiLocationOn } from "react-icons/ci";
import { InputNumber } from 'antd';
import { Select } from 'antd';
import { Space } from 'antd';

import './RestaurantList.css';



const RestaurantList = () => {
  const { Search } = Input;
  const [restaurants, setRestaurants] = useState([]);
  const [total, setTotal] = useState(0);
  const [filterByCountry, setFilterByCountry] = useState(null);
  const [filterByMinPrice, setFilterByMinPrice] = useState(null);
  const [filterByMaxPrice, setFilterByMaxPrice] = useState(null);
  const [filterBySearchWord, setFilterBySearchWord] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);

  const countries = [
    'India', 'Australia', 'Brazil', 'Canada', 'Indonesia', 'New Zealand',
    'Philippines', 'Qatar', 'Singapore', 'South Africa', 'Sri Lanka',
    'Turkey', 'UAE', 'United Kingdom', 'United States'
  ];


  const onCountryChange = (value) => {
    console.log(`selected ${value}`);
    setFilterByCountry(value);
  }

  const onMinPriceChange = (value) => {
    console.log(`selected ${value}`);
    setFilterByMinPrice(value);
  }

  const onMaxPriceChange = (value) => {
    console.log(`selected ${value}`);
    setFilterByMaxPrice(value);
  }



  const onPageChange = (pageNumber, pageSize) => {
    console.log('Page: ', pageNumber, 'Page Size: ', pageSize);
    fetch(`http://localhost:5000/api/restaurants?page=${pageNumber}&limit=${pageSize}`)
      .then(response => response.json())
      .then(data => {
        setRestaurants(data.data);
      })
  };

  const onSearch = async (value, _e, info) => {
    try {
      const backendUrl = `http://localhost:5000/api/restaurants`;
      // Apply all the filters which are not null in the url 
      const url = new URL(backendUrl);
      if (filterByCountry) {
        url.searchParams.append('filterByCountry', filterByCountry);
      }
      if (filterByMinPrice) {
        url.searchParams.append('filterByMinPrice', filterByMinPrice);
      }
      if (filterByMaxPrice) {
        url.searchParams.append('filterByMaxPrice', filterByMaxPrice);
      }
      if (filterBySearchWord) {
        url.searchParams.append('search_word', value);
      }
      console.log('URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      setTotal(data.total);
      setRestaurants(data.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const onSearchWordChange = (e) => {
    setFilterBySearchWord(e.target.value);
  };

  const onCurrentLocationClick = async () => {
    try {
      // Get the user's current position
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Latitude:', latitude, 'Longitude:', longitude);
        setLatitude(latitude);
        setLongitude(longitude);
      }, (error) => {
        console.error('Error fetching location:', error);
        alert('Unable to retrieve your location. Please check your location settings.');
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const onSearchByLocation = async () => {
    try {
      const backendUrl = `http://localhost:5000/api/restaurants/nearby`;
      // Apply all the filters which are not null in the url 
      const url = new URL(backendUrl);
      if (latitude && longitude) {
        url.searchParams.append('lat', latitude);
        url.searchParams.append('lng', longitude);
      }
      console.log('URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      setTotal(data.total);
      setRestaurants(data.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/restaurants')
      .then(response => response.json())
      .then(data => {
        setTotal(data.total)
        setRestaurants(data.data)
      })
      .catch(error => console.error('Error fetching restaurants:', error));
  }, []);

  return (
    <div className='pb-12 mt-6'>

      <div className='flex  w-full pl-[100px] pr-[100px] justify-between mb-5 mt-8'>
        <div className='flex'>
          <Select
            showSearch
            size='large'
            placeholder="Filter by Country"
            value={filterByCountry}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={countries.map(country => ({ value: country, label: country }))}
            onChange={onCountryChange}
          />

          <InputNumber size='large' value={filterByMinPrice} style={{ width: 150, margin: '0 20px' }} min={0} placeholder='Min Cost for 2' onChange={onMinPriceChange} />
          <InputNumber size='large' value={filterByMaxPrice} style={{ width: 150, marginRight: '20px' }} min={0} placeholder='Max Cost for 2' onChange={onMaxPriceChange} />
            <Search
             style={{ width: 400 }}
              value={filterBySearchWord}
              placeholder="Search for any restaurant / cuisine"
              allowClear
              enterButton="Search / Filter"
              size="large"
              onSearch={onSearch}
              onChange={onSearchWordChange}
            />
          
        </div>

        <div className='flex'>
          <Space.Compact size="large">
            <Input value={longitude} onChange={(e) => { setLongitude(e.target.value) }} style={{ width: 100 }} placeholder="longitude" />
            <Input value={latitude} onChange={(e) => { setLatitude(e.target.value) }} style={{ width: 100 }} placeholder="latitude" />
          </Space.Compact>

          <div className='ml-4'>
            <Tooltip title="Use Your Current Location">
              <Button onClick={onCurrentLocationClick} shape="circle" size='large'>
                <CiLocationOn className='text-3xl' />
              </Button>
            </Tooltip>
          </div>

          <Button onClick={onSearchByLocation} type="primary" className='ml-4' size='large'>Search</Button>

        </div>



      </div>

      <div className='restaruant-cards flex justify-around flex-wrap p-4 mt-2 mb-2'>
        {
          restaurants === undefined || restaurants.length === 0 ? <h2>No restaurants found</h2> :
            restaurants.map(restaurant => {
              return <Link to={`/restaurant/${restaurant.id}`}>
                <Card
                  hoverable
                  style={{
                    width: 470,
                    marginLeft: '30px',
                    marginBottom: '30px',
                    border: '2px solid #e8e8e8',
                  }}
                >
                  <div className='thumb-image w-[450px] h-[250px] rounded-xl mt-2 ml-auto mr-auto overflow-hidden'>
                    <img className='w-full h-full object-cover rounded-xl' src={restaurant.thumb} alt={restaurant.name} />
                  </div>
                  <div className='p-4 h-[140px]'>
                    <h2 style={{ fontFamily: "Montserrat" }} className='text-xl font-bold mb-2 text-purple-900'>{restaurant.name}</h2>
                    <div className='flex justify-between mb-[10px]'>
                      <p className='text-gray-700 text-[15px] font-open-sans'>
                        <span className='font-bold text-black mr-[5px] font-roboto'>Average Cost for Two:</span>
                        <span className='text-green-600'>{restaurant.currency} {restaurant.average_cost_for_two}</span>
                      </p>
                      <p className={`text-[15px] font-bold ${restaurant.user_rating.aggregate_rating >= 4.5
                        ? 'text-green-500'
                        : restaurant.user_rating.aggregate_rating >= 3.0
                          ? 'text-yellow-500'
                          : 'text-red-500'
                        } font-roboto`}>
                        Rating: {restaurant.user_rating.aggregate_rating}
                        <span className='text-gray-600 font-medium font-open-sans'> ({restaurant.user_rating.votes} votes)</span>
                      </p>
                    </div>
                    <p className='text-gray-700 font-open-sans'>
                      {restaurant.location.address}, <span className='text-blue-500'>{restaurant.location.city}</span>
                    </p>
                  </div>
                </Card>

              </Link>

            })
        }
      </div>

      <Pagination showQuickJumper align='center' defaultPageSize={9} pageSizeOptions={[9, 18, 30]} total={total} onChange={onPageChange} />
    </div>
  );
};

export default RestaurantList;
