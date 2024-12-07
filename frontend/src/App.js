// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ServicePage from './components/ServicePage';
import NetworkPage from './components/NetworkPage';
import StoragePage from './components/StoragePage';
import './index.css'; // CSS 파일 추가
function App() {
    return (

        <Router>
            <div>
                <h1>Docker Swarm Dashboard</h1>
                <Navbar/>
                <Routes>
                    <Route path="/services" element={<ServicePage/>}/>
                    <Route path="/networks" element={<NetworkPage/>}/>
                    <Route path="/storage" element={<StoragePage/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
