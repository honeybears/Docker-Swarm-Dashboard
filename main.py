from fastapi import FastAPI, WebSocket
import docker
from response import ServiceResponseDTO
import asyncio
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = docker.from_env()

@app.get("/services", response_model=list[ServiceResponseDTO])
async def get_services():
    services = client.services.list()
    service_data = [
        ServiceResponseDTO(
            id=service.id,
            name=service.name,
            replicas=service.attrs['Spec']['Mode']['Replicated']['Replicas']
        )
        for service in services
    ]
    return service_data
@app.websocket("/ws/services")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("gi")
    try:
        while True:
            # Docker 서비스 데이터 수집
            services = client.services.list()
            service_data = [
                {
                    "id": service.id,
                    "name": service.name,
                    "replicas": service.attrs['Spec']['Mode']['Replicated']['Replicas']
                }
                for service in services
            ]
            print("Sending data:", service_data)  # 전송 데이터 로그 추가
            await websocket.send_json(service_data)
            await asyncio.sleep(2)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        await websocket.close()

