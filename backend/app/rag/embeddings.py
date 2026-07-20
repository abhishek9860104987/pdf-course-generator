from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List
import os


class EmbeddingGenerator:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize the embedding model."""
        self.model = SentenceTransformer(model_name)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a list of texts."""
        return self.model.encode(texts, show_progress_bar=True)

    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        return self.model.encode(text)

    def save_model(self, path: str):
        """Save the model to disk."""
        self.model.save(path)

    @classmethod
    def load_model(cls, path: str):
        """Load a model from disk."""
        model = SentenceTransformer(path)
        instance = cls.__new__(cls)
        instance.model = model
        instance.embedding_dim = model.get_sentence_embedding_dimension()
        return instance
