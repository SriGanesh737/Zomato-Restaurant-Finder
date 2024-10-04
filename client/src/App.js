import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import ImageSearch from './pages/ImageSearch';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className=''>
        <Routes>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/image-search" element={<ImageSearch />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
