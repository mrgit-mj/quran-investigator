import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage'; // You'll create this page next
import NavBar from './pages/NavBar';
import Viewer from './pages/Viewer';

const App: React.FC = () => {
  return (
    <div>
      <NavBar/>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/viewer" element={<Viewer />} />
        {/* Add more routes here later */}
      </Routes>
    </div>
  );
};

export default App;