from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import bcrypt
import logging
import openai
import secrets

logging.basicConfig(level=logging.INFO)

# Set your OpenAI API key
openai_api_key = ''
openai.api_key = openai_api_key

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # SQLite database
app.secret_key = secrets.token_hex(16)  # Secret key for session management
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"User('{self.username}')"

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    user_message = db.Column(db.String(500))
    chatbot_response = db.Column(db.String(500))

    def __repr__(self):
        return f"ChatHistory('{self.user_message}', '{self.chatbot_response}')"

def generate_session_id():
    # Generate a random session ID
    return secrets.token_hex(16)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Check if username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists'})

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create a new user
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Signup successful'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password').encode('utf-8')

    # Retrieve user from database
    user = User.query.filter_by(username=username).first()

    # Check if user exists and password is correct
    if user and bcrypt.checkpw(password, user.password):
        # Generate and store session ID
        session['user_id'] = generate_session_id()
        logging.info(f'Session: {session}')
        return jsonify({'success': True, 'message': 'Login successful', 'sessionId': session['user_id']})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'})

@app.route('/chatbot', methods=['POST'])
def chatbot():
    logging.info('Chatbot API called')
    data = request.json
    user_message = data.get('message')

    # Retrieve session ID from session
    session_id = data.get('session_id')

    # Call OpenAI ChatGPT API to generate response
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_message},
        ]
    )
    chatbot_response = response['choices'][0]['message']['content']

    # Store chat history with session ID
    logging.info(f'Session ID: {session_id}, User message: {user_message}, Chatbot response: {chatbot_response}')
    chat_history = ChatHistory(session_id=session_id, user_message=user_message, chatbot_response=chatbot_response)
    try:
        db.session.add(chat_history)
        db.session.commit()
    except Exception as e:
        logging.error(f'Error: {e}')
        return jsonify({'message': 'Error storing chat history'})

    return jsonify({'message': chatbot_response})

@app.route('/chat/history/<session_id>', methods=['GET'])
def get_chat_history(session_id):
    # Retrieve session ID from session
    # session_id = session['user_id']

    # Use session ID to retrieve user's chat history from database
    chat_history = ChatHistory.query.filter_by(session_id=session_id).all()

    # Format chat history
    formatted_chat_history = [{'user': chat.user_message, 'chatbot': chat.chatbot_response} for chat in chat_history]

    return jsonify(formatted_chat_history)

@app.route('/logout', methods=['GET'])
def logout():
    # Clear session data
    session.clear()
    return jsonify({'success': True, 'message': 'Logout successful'})

