from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import cv2
import numpy as np
from tensorflow.keras.applications import VGG16
from tensorflow.keras.applications.vgg16 import preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from sklearn.metrics.pairwise import cosine_similarity
import tempfile
import base64
from PIL import Image
import io

forgery_bp = Blueprint('forgery', __name__)

# Initialize VGG16 model for feature extraction
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(1024, activation='relu')(x)
feature_extractor = Model(inputs=base_model.input, outputs=x)

# Make the feature extractor non-trainable for faster inference
for layer in feature_extractor.layers:
    layer.trainable = False

def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(img_path):
    """Preprocess image for VGG16 model"""
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        return img_array
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def extract_features(img_path):
    """Extract features using VGG16 model"""
    try:
        preprocessed_img = preprocess_image(img_path)
        features = feature_extractor.predict(preprocessed_img, verbose=0)
        return features.flatten()
    except Exception as e:
        raise ValueError(f"Error extracting features: {str(e)}")

def calculate_similarity(features1, features2):
    """Calculate cosine similarity between two feature vectors"""
    similarity = cosine_similarity([features1], [features2])[0][0]
    return float(similarity)

def detect_forgery(similarity_score, threshold=0.85):
    """Detect forgery based on similarity score"""
    if similarity_score >= threshold:
        return {
            'is_forgery': False,
            'confidence': float(similarity_score),
            'status': 'Original',
            'message': 'Images appear to be authentic/similar'
        }
    else:
        return {
            'is_forgery': True,
            'confidence': float(1 - similarity_score),
            'status': 'Potential Forgery',
            'message': 'Images show significant differences, potential forgery detected'
        }

def save_base64_image(base64_string, filename):
    """Save base64 encoded image to temporary file"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        
        # Create temporary file
        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, filename)
        
        # Save image
        with open(file_path, 'wb') as f:
            f.write(image_data)
        
        return file_path
    except Exception as e:
        raise ValueError(f"Error saving base64 image: {str(e)}")

@forgery_bp.route('/analyze', methods=['POST'])
def analyze_images():
    """Main endpoint for forgery detection"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check if both images are provided
        if 'image1' not in data or 'image2' not in data:
            return jsonify({'error': 'Both image1 and image2 are required'}), 400
        
        # Get threshold from request or use default
        threshold = float(data.get('threshold', 0.85))
        
        # Save base64 images to temporary files
        temp_file1 = save_base64_image(data['image1'], 'temp_image1.jpg')
        temp_file2 = save_base64_image(data['image2'], 'temp_image2.jpg')
        
        try:
            # Extract features from both images
            features1 = extract_features(temp_file1)
            features2 = extract_features(temp_file2)
            
            # Calculate similarity
            similarity_score = calculate_similarity(features1, features2)
            
            # Detect forgery
            result = detect_forgery(similarity_score, threshold)
            
            # Add additional metrics
            result.update({
                'similarity_score': similarity_score,
                'threshold_used': threshold,
                'analysis_method': 'VGG16 Feature Extraction + Cosine Similarity',
                'timestamp': str(np.datetime64('now'))
            })
            
            return jsonify(result), 200
            
        finally:
            # Clean up temporary files
            try:
                os.unlink(temp_file1)
                os.unlink(temp_file2)
            except:
                pass
                
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@forgery_bp.route('/upload', methods=['POST'])
def upload_images():
    """Alternative endpoint for file upload"""
    try:
        # Check if files are present
        if 'image1' not in request.files or 'image2' not in request.files:
            return jsonify({'error': 'Both image1 and image2 files are required'}), 400
        
        file1 = request.files['image1']
        file2 = request.files['image2']
        
        # Check if files are selected
        if file1.filename == '' or file2.filename == '':
            return jsonify({'error': 'No files selected'}), 400
        
        # Check file extensions
        if not (allowed_file(file1.filename) and allowed_file(file2.filename)):
            return jsonify({'error': 'Invalid file format. Allowed: png, jpg, jpeg, gif, bmp, tiff'}), 400
        
        # Get threshold from form data
        threshold = float(request.form.get('threshold', 0.85))
        
        # Save uploaded files temporarily
        temp_dir = tempfile.gettempdir()
        temp_file1 = os.path.join(temp_dir, secure_filename(file1.filename))
        temp_file2 = os.path.join(temp_dir, secure_filename(file2.filename))
        
        file1.save(temp_file1)
        file2.save(temp_file2)
        
        try:
            # Extract features from both images
            features1 = extract_features(temp_file1)
            features2 = extract_features(temp_file2)
            
            # Calculate similarity
            similarity_score = calculate_similarity(features1, features2)
            
            # Detect forgery
            result = detect_forgery(similarity_score, threshold)
            
            # Add additional metrics
            result.update({
                'similarity_score': similarity_score,
                'threshold_used': threshold,
                'analysis_method': 'VGG16 Feature Extraction + Cosine Similarity',
                'timestamp': str(np.datetime64('now')),
                'file1_name': file1.filename,
                'file2_name': file2.filename
            })
            
            return jsonify(result), 200
            
        finally:
            # Clean up temporary files
            try:
                os.unlink(temp_file1)
                os.unlink(temp_file2)
            except:
                pass
                
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@forgery_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'VGG16',
        'version': '1.0.0',
        'supported_formats': ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff']
    }), 200

@forgery_bp.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'model_name': 'VGG16',
        'model_type': 'Convolutional Neural Network',
        'feature_extraction': 'Deep Learning Features',
        'similarity_metric': 'Cosine Similarity',
        'input_size': '224x224x3',
        'default_threshold': 0.85,
        'description': 'VGG16-based feature extraction for image forgery detection using cosine similarity'
    }), 200

