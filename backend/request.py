from pydantic import BaseModel


from pydantic import BaseModel, Field
from typing import List, Optional


class EndpointSpecDto(BaseModel):
    protocol: str
    target_port: int
    published_port: int
class CreateServiceRequestDto(BaseModel):
    name: str
    image: str
    replicas: int
    network: str
    endpoint_specs: List[EndpointSpecDto]
