import faiss
import numpy as np
import pickle
import os
from typing import List, Tuple, Optional
from app.rag.embeddings import EmbeddingGenerator


class VectorStore:
    def __init__(self, embedding_dim: int = 384):
        """Initialize the vector store."""
        self.embedding_dim = embedding_dim
        self.index = None
        self.documents = []
        self.embeddings = None

    def create_index(self, embeddings: np.ndarray):
        """Create a FAISS index from embeddings."""
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.index.add(embeddings.astype('float32'))
        self.embeddings = embeddings

    def add_documents(self, documents: List[str], embeddings: np.ndarray):
        """Add documents and their embeddings to the index."""
        if self.index is None:
            self.create_index(embeddings)
        else:
            self.index.add(embeddings.astype('float32'))
        
        self.documents.extend(documents)
        if self.embeddings is None:
            self.embeddings = embeddings
        else:
            self.embeddings = np.vstack([self.embeddings, embeddings])

    def search(self, query_embedding: np.ndarray, k: int = 5) -> List[Tuple[int, float]]:
        """Search for similar documents."""
        if self.index is None:
            return []
        
        query_embedding = query_embedding.reshape(1, -1).astype('float32')
        distances, indices = self.index.search(query_embedding, k)
        
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx < len(self.documents):
                results.append((int(idx), float(dist)))
        
        return results

    def save(self, path: str):
        """Save the vector store to disk."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(self.index, f"{path}.index")
        
        # Save documents
        with open(f"{path}.docs", 'wb') as f:
            pickle.dump(self.documents, f)
        
        # Save embeddings
        with open(f"{path}.emb", 'wb') as f:
            pickle.dump(self.embeddings, f)

    @classmethod
    def load(cls, path: str, embedding_dim: int = 384):
        """Load a vector store from disk."""
        instance = cls(embedding_dim)
        
        # Load FAISS index
        instance.index = faiss.read_index(f"{path}.index")
        
        # Load documents
        with open(f"{path}.docs", 'rb') as f:
            instance.documents = pickle.load(f)
        
        # Load embeddings
        with open(f"{path}.emb", 'rb') as f:
            instance.embeddings = pickle.load(f)
        
        return instance

    def get_document(self, idx: int) -> Optional[str]:
        """Get a document by index."""
        if 0 <= idx < len(self.documents):
            return self.documents[idx]
        return None


class CourseVectorStore:
    """Vector store specific to a course."""
    
    def __init__(self, course_id: str, base_path: str = "./vector_stores"):
        self.course_id = course_id
        self.base_path = base_path
        self.store_path = os.path.join(base_path, course_id)
        self.vector_store: Optional[VectorStore] = None
        self.embedding_generator = EmbeddingGenerator()

    def initialize_from_content(self, content_chunks: List[str]):
        """Initialize vector store from content chunks."""
        embeddings = self.embedding_generator.generate_embeddings(content_chunks)
        
        self.vector_store = VectorStore(self.embedding_generator.embedding_dim)
        self.vector_store.add_documents(content_chunks, embeddings)
        
        self.save()

    def search(self, query: str, k: int = 5) -> List[Tuple[str, float]]:
        """Search for relevant content."""
        if self.vector_store is None:
            self.load()
        
        if self.vector_store is None:
            return []
        
        query_embedding = self.embedding_generator.generate_embedding(query)
        results = self.vector_store.search(query_embedding, k)
        
        return [
            (self.vector_store.get_document(idx), dist)
            for idx, dist in results
        ]

    def save(self):
        """Save the vector store."""
        if self.vector_store:
            self.vector_store.save(self.store_path)

    def load(self):
        """Load the vector store."""
        if os.path.exists(f"{self.store_path}.index"):
            self.vector_store = VectorStore.load(
                self.store_path,
                self.embedding_generator.embedding_dim
            )

    def exists(self) -> bool:
        """Check if vector store exists."""
        return os.path.exists(f"{self.store_path}.index")
