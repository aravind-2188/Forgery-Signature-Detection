import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db, User  # ✅ Import User model
from src.routes.user import user_bp
from src.routes.forgery_detection import forgery_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(forgery_bp, url_prefix='/api/forgery')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create tables and insert sample user
with app.app_context():
    db.create_all()
    if not User.query.first():
        sample_user = User(username='aravind', email='aravind@example.com')
        db.session.add(sample_user)
        db.session.commit()

# Serve static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# ✅ Test route to verify DB
@app.route('/test-db')
def test_db():
    try:
        users = User.query.all()
        return f"Found {len(users)} users in the database."
    except Exception as e:
        return f"Database error: {str(e)}"

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
