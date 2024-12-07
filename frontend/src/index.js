import React from 'react';
import ReactDOM from 'react-dom/client'; // ReactDOM 18+용 API
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // 기존 render 대신 createRoot 사용
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
