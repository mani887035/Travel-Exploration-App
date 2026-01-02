import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class RAGEngine:
    def __init__(self, data_path='app/data/destinations.json'):
        self.data_path = data_path
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.data = self._load_data()
        self.embeddings = self._create_embeddings()

    def _load_data(self):
        with open(self.data_path, 'r') as f:
            return json.load(f)

    def _create_embeddings(self):
        texts = [f"{item['name']} {item['type']} {item['season']} {item['description']}" for item in self.data]
        return self.encoder.encode(texts)

    def search(self, query, top_k=3):
        query_embedding = self.encoder.encode([query])
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]
        # Get top_k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append({
                'destination': self.data[idx],
                'score': float(similarities[idx])
            })
        return results

    def generate_response(self, query):
        """
        Mock LLM generation. 
        It retrieves relevant destinations and constructs a natural language response.
        """
        results = self.search(query)
        
        if not results:
            return "I couldn't find any destinations matching your request. Try asking about beaches, mountains, or specific seasons!"
        
        # Construct a response based on the top result
        top_pick = results[0]['destination']
        others = results[1:]
        
        response = f"Based on your interest in '{query}', I highly recommend **{top_pick['name']}**.\n\n"
        response += f"{top_pick['description']}\n\n"
        response += f"It's great for a {top_pick['season']} trip provided you enjoy {top_pick['type']} destinations."
        
        if others:
            response += "\n\nYou might also like: " + ", ".join([r['destination']['name'] for r in others]) + "."
            
        return {
            "answer": response,
            "sources": results
        }

# Singleton instance
rag_engine = None

def init_rag_engine():
    global rag_engine
    rag_engine = RAGEngine()
