import React, { useEffect, useState } from 'react';
import NetworkSelector from "./NetworkSelector";
import './ServicePage.css';

function ServicePage() {
    const [services, setServices] = useState([]); // 서비스 데이터 상태
    const [connectionStatus, setConnectionStatus] = useState('Disconnected'); // 연결 상태
    const [showCreateService, setShowCreateService] = useState(false); // "서비스 추가" 버튼 표시 여부
    const [newServiceName, setNewServiceName] = useState(""); // 새로운 서비스 이름
    const [imageName, setImageName] = useState("nginx:latest"); // 새로운 서비스 이미지
    const [replicas, setReplicas] = useState(1); // 새로운 서비스 복제본 수
    const [networkName, setNetworkName] = useState(""); // 네트워크 이름
    const [endpoints, setEndpoints] = useState([{ protocol: "tcp", target_port: 80, published_port: 8080 }]); // 엔드포인트 사양

    // WebSocket 연결 설정
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:5000/ws/services');

        ws.onopen = () => {
            console.log("WebSocket connection established.");
            setConnectionStatus('Connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data); // JSON 데이터 파싱
                console.log("Received data:", data); // 데이터 확인
                setServices(data); // 상태 업데이트
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed.");
            setConnectionStatus('Disconnected');
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setConnectionStatus('Error');
        };

        return () => {
            ws.close();
        };
    }, []);

    // 엔드포인트 추가
    const handleAddEndpoint = () => {
        setEndpoints([...endpoints, { protocol: "tcp", target_port: 0, published_port: 0 }]);
    };

    // 엔드포인트 업데이트
    const handleUpdateEndpoint = (index, field, value) => {
        const updatedEndpoints = [...endpoints];
        updatedEndpoints[index][field] = value;
        setEndpoints(updatedEndpoints);
    };

    // 서비스 생성 요청
const handleCreateService = async () => {
    try {
        const response = await fetch('http://localhost:5000/services/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newServiceName,         // 서비스 이름
                image: imageName,             // 이미지 이름
                replicas: replicas,           // 복제본 수
                network: networkName,         // 네트워크 이름
                endpoint_specs: endpoints,    // 엔드포인트 사양
            }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Service created successfully with ID: ${result.service_id}`);
            handleCloseForm(); // 폼 초기화 및 닫기
        } else {
            alert(`Error creating service: ${result.error}`);
        }
    } catch (error) {
        console.error("Error creating service:", error);
        alert("Failed to create service.");
    }
};

    // 폼 닫기 및 초기화
    const handleCloseForm = () => {
        setNewServiceName("");
        setImageName("nginx:latest");
        setReplicas(1);
        setNetworkName("");
        setEndpoints([{ protocol: "tcp", target_port: 80, published_port: 8080 }]);
        setShowCreateService(false); // 폼 숨기기
    };

    return (
        <div>
            {/* Add + 버튼 */}
            {!showCreateService && (
                <button onClick={() => setShowCreateService(true)} className="add-button">
                    Add +
                </button>
            )}

            {/* 서비스 생성 폼 */}
            {showCreateService && (
                <div className="service-creation-form">
                    <input
                        type="text"
                        placeholder="Service Name"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Image Name"
                        value={imageName}
                        onChange={(e) => setImageName(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Replicas"
                        value={replicas}
                        onChange={(e) => setReplicas(Number(e.target.value))}
                        min="1"
                    />

                    {/* 네트워크 선택 */}
                    <NetworkSelector onSelectNetwork={(network) => setNetworkName(network)} />

                    {/* 엔드포인트 관리 */}
                    <h3>Endpoint Specifications</h3>
                    {endpoints.map((endpoint, index) => (
                        <div key={index} className="endpoint-form">
                            <select
                                value={endpoint.protocol}
                                onChange={(e) => handleUpdateEndpoint(index, "protocol", e.target.value)}
                            >
                                <option value="tcp">TCP</option>
                                <option value="udp">UDP</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Target Port"
                                value={endpoint.target_port}
                                onChange={(e) => handleUpdateEndpoint(index, "target_port", Number(e.target.value))}
                            />
                            <input
                                type="number"
                                placeholder="Published Port"
                                value={endpoint.published_port}
                                onChange={(e) => handleUpdateEndpoint(index, "published_port", Number(e.target.value))}
                            />
                        </div>
                    ))}
                    <button onClick={handleAddEndpoint}>Add Endpoint</button>
                    <br />

                    <div className="form-buttons">
                        <button onClick={handleCreateService} className="create-service-button">
                            Create Service
                        </button>
                        <button onClick={handleCloseForm} className="close-button">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* 서비스 목록 테이블 */}
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

export default ServicePage;
