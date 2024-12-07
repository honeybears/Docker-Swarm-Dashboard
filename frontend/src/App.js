import React, { useState, useEffect } from 'react';

function App() {
    const [services, setServices] = useState([]); // 서비스 데이터 상태
    const [connectionStatus, setConnectionStatus] = useState('Disconnected'); // 연결 상태

    useEffect(() => {
        // WebSocket 초기화
        const ws = new WebSocket('ws://localhost:5000/ws/services');

        // WebSocket 연결 열림
        ws.onopen = () => {
            console.log("WebSocket connection established.");
            setConnectionStatus('Connected');
        };

        // WebSocket 메시지 수신
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data); // JSON 데이터 파싱
                console.log("Received data:", data); // 데이터 확인
                setServices(data); // 상태 업데이트
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        // WebSocket 연결 닫힘
        ws.onclose = () => {
            console.log("WebSocket connection closed.");
            setConnectionStatus('Disconnected');
        };

        // WebSocket 에러 발생
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setConnectionStatus('Error');
        };

        // 컴포넌트 언마운트 시 WebSocket 연결 닫기
        return () => {
            ws.close();
        };
    }, []);

    return (
        <div>
            <h1>Docker Swarm Dashboard</h1>
            <p>Connection Status: {connectionStatus}</p>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Replicas</th>
                    </tr>
                </thead>
                <tbody>
                    {services.length > 0 ? (
                        services.map((service) => (
                            <tr key={service.id}>
                                <td>{service.id}</td>
                                <td>{service.name}</td>
                                <td>{service.replicas}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No services available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default App;
