import React, { useEffect, useState } from 'react';
import './ServicePage.css';

function NetworkSelector({ onSelectNetwork }) {
    const [networks, setNetworks] = useState([]); // 네트워크 데이터 초기값을 빈 배열로 설정
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태 관리
    const [error, setError] = useState(null); // 에러 상태 관리

    useEffect(() => {
        fetch('http://localhost:5000/networks')
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setNetworks(data); // 데이터가 배열일 경우에만 설정
                } else {
                    setNetworks([]); // 데이터가 배열이 아닐 경우 빈 배열 설정
                    console.error("Unexpected response format:", data);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching networks:", error);
                setError("Failed to load networks.");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Loading networks...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <select onChange={(e) => onSelectNetwork(e.target.value)} className="network-selector">
            <option value="">Select a network</option>
            {networks.map((network, index) => (
                <option key={index} value={network.name}>
                    {network.name} ({network.driver})
                </option>
            ))}
        </select>
    );
}

export default NetworkSelector;

