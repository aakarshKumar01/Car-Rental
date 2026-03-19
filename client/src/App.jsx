import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Cars from './pages/Cars'
import MyBookings from './pages/MyBookings'
import CarDetails from './pages/CarDetails'
import { Route, Routes, useLocation } from 'react-router-dom';

const App = () => {

  const [showLogin, setShowLogin] = useState(false);
  const isOwnerPath =  useLocation().pathname.startsWith('/owner');

  return (
    <>
      {!isOwnerPath && <Navbar setShowLogin={setShowLogin}/>}

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cars" element={<Cars />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/car-details/:id" element={<CarDetails />} />
    </Routes>

    </>
  )
}

export default App
