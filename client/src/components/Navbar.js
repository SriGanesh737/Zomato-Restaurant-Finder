import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-950 to-pink-400 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-extrabold">
          Restaurant Finder
        </Link>
        <div className="space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-white text-lg font-semibold border-b-2 border-white"
                : "text-gray-200 text-lg font-semibold hover:text-white"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/image-search"
            className={({ isActive }) =>
              isActive
                ? "text-white text-lg font-semibold border-b-2 border-white"
                : "text-gray-200 text-lg font-semibold hover:text-white"
            }
          >
            Image Search
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
