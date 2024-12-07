from pydantic import BaseModel


class ServiceResponseDTO(BaseModel):
    id: str
    name: str
    replicas: int
