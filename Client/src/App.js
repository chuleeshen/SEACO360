import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import GlobeDashboard from './components/GlobeDashboard';
import Registration from './components/Registration';
import Page3 from './components/Page3';
import HealthChart2013 from './components/HealthChart2013';
import HealthChart2018 from './components/HealthChart2018';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/healthchart2013" element={<HealthChart2013 />} />
        <Route path="/healthchart2018" element={<HealthChart2018 />} />
        <Route path="/globedashboard" element={<GlobeDashboard />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/page3" element={<Page3 />} />
        <Route path="/" element={<GlobeDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
