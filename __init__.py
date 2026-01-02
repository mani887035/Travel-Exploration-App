from flask import Flask
from .rag_engine import init_rag_engine

def create_app():
    # Static and template folders are inside the app package, so defaults work fine
    app = Flask(__name__)
    
    with app.app_context():
        # Initialize RAG engine (load model and data)
        print("Initializing RAG Engine...")
        init_rag_engine()
        print("RAG Engine Ready.")
        
        from .routes import main_bp
        app.register_blueprint(main_bp)
        
    return app
