from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str
    pdf_id: str