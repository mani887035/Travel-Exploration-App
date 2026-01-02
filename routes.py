from flask import Blueprint, render_template, request, jsonify
from .rag_engine import rag_engine

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/api/explore')
def explore():
    # Return all destinations for exploration grid
    # Filter by season or type
    season = request.args.get('season')
    comp_type = request.args.get('type')
    
    data = rag_engine.data
    
    if season:
        data = [d for d in data if d['season'].lower() == season.lower()]
        
    if comp_type and comp_type.lower() != 'all':
        data = [d for d in data if d['type'].lower() == comp_type.lower()]
        
    return jsonify(data)

@main_bp.route('/api/chat', methods=['POST'])
def chat():
    print("Chat Request Received")
    data = request.json
    query = data.get('query', '')
    if not query:
        return jsonify({"answer": "Please ask a question!"})
        
    response = rag_engine.generate_response(query)
    return jsonify(response)
