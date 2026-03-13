from typing import List, Union
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embeddings(
    texts: Union[str, List[str]]
) -> List[List[float]]:
    
   #Embeddings for one or many texts.

    if isinstance(texts, str): # convert single string to list
        texts = [texts]

    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=False,
        normalize_embeddings=True
    )

    return embeddings.tolist()
