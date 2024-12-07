// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            <ul style={{ listStyle: 'none', display: 'flex', gap: '20px' }}>
                <li>
                    <Link to="/services">Services</Link>
                </li>
                <li>
                    <Link to="/networks">Storages</Link>
                </li>
                <li>
                    <Link to="/storage">Networks</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
