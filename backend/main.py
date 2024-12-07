from fastapi import FastAPI, WebSocket, HTTPException
import docker

from request import CreateServiceRequestDto
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


@app.post("/services/create")
async def create_service(request: CreateServiceRequestDto):
    """
    Create a new Docker Swarm service based on the request.
    """
    try:
        # 네트워크 이름을 기반으로 네트워크 ID 검색
        networks = client.networks.list(names=[request.network])
        if not networks:
            raise HTTPException(status_code=400, detail=f"Network '{request.network}' not found.")
        if len(networks) > 1:
            raise HTTPException(
                status_code=400,
                detail=f"Network '{request.network}' is ambiguous ({len(networks)} matches found).",
            )

        network_id = networks[0].id  # 첫 번째 일치하는 네트워크 ID 사용

        # Docker 서비스 생성
        service = client.services.create(image=request.image, command=None, name=request.name)

        # service = client.services.create(
        #     name=request.name,
        #     task_template=docker.types.TaskTemplate(
        #         container_spec=docker.types.ContainerSpec(
        #             image=request.image  # 요청된 이미지 설정
        #         )
        #     ),
        #     mode={"Replicated": {"Replicas": request.replicas}},
        #     networks=[{"Target": network_id}],  # 네트워크 ID 사용
        #     endpoint_spec={
        #         "Ports": [
        #             {
        #                 "Protocol": spec.protocol,
        #                 "TargetPort": spec.target_port,
        #                 "PublishedPort": spec.published_port,
        #             }
        #             for spec in request.endpoint_specs
        #         ]
        #     },
        # )
        return {"status": "success", "service_id": service.id}
    except docker.errors.APIError as e:
        print("Docker API Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Docker API Error: {str(e)}")
    except Exception as e:
        print("Unexpected Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")
@app.get("/networks")
async def get_networks():
    try:
        networks = client.networks.list()
        return [{"name": network.name, "driver": network.attrs["Driver"]} for network in networks]
    except Exception as e:
        return {"error": str(e)}
