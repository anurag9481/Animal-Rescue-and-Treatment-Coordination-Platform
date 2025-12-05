from flask import Flask, request, render_template, jsonify
import sqlite3
import os

app = Flask(__name__)

# Path to the database
DATABASE = 'rescue.db'

# Function to initialize the database
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS rescue_requests (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        email TEXT,
                        location TEXT,
                        description TEXT,
                        animal_image TEXT,
                        animal_video TEXT)''')
        conn.execute('''CREATE TABLE IF NOT EXISTS complaints (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        email TEXT,
                        description TEXT)''')
        conn.execute('''CREATE TABLE IF NOT EXISTS donations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        amount REAL)''')
        conn.execute('''CREATE TABLE IF NOT EXISTS vet_consults (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        email TEXT,
                        contact_method TEXT)''')

# Call the init_db function when the app starts
@app.before_first_request
def before_first_request():
    init_db()

# Route for the homepage (index)
@app.route('/')
def home():
    return render_template('index.html')

# Route for rescue request form submission
@app.route('/rescue', methods=['POST'])
def rescue():
    name = request.json.get('name')
    email = request.json.get('email')
    location = request.json.get('location')
    description = request.json.get('description')
    animal_image = request.json.get('animal-image')
    animal_video = request.json.get('animal-video')
    
    # Save rescue request to the database
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''INSERT INTO rescue_requests (name, email, location, description, animal_image, animal_video)
                        VALUES (?, ?, ?, ?, ?, ?)''', (name, email, location, description, animal_image, animal_video))
    
    return jsonify({"message": "Rescue request submitted successfully!"}), 200

# Route for filing a complaint
@app.route('/complain', methods=['POST'])
def complain():
    name = request.json.get('name')
    email = request.json.get('email')
    description = request.json.get('description')
    
    # Save complaint to the database
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''INSERT INTO complaints (name, email, description)
                        VALUES (?, ?, ?)''', (name, email, description))
    
    return jsonify({"message": "Complaint submitted successfully!"}), 200

# Route for donations
@app.route('/donate', methods=['POST'])
def donate():
    amount = request.json.get('amount')
    
    # Save donation to the database
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''INSERT INTO donations (amount)
                        VALUES (?)''', (amount,))
    
    return jsonify({"message": "Donation received successfully!"}), 200

# Route for vet consultations
@app.route('/consult', methods=['POST'])
def consult():
    name = request.json.get('name')
    email = request.json.get('email')
    contact_method = request.json.get('contact_method')
    
    # Save consultation request to the database
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''INSERT INTO vet_consults (name, email, contact_method)
                        VALUES (?, ?, ?)''', (name, email, contact_method))
    
    return jsonify({"message": "Consultation request submitted successfully!"}), 200

# Error handling for 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
