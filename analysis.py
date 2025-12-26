from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Analysis(db.Model):
    """Model for storing forgery analysis results"""
    __tablename__ = 'analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    similarity_score = db.Column(db.Float, nullable=False)
    is_forgery = db.Column(db.Boolean, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    threshold_used = db.Column(db.Float, nullable=False, default=0.85)
    status = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text)
    analysis_method = db.Column(db.String(100), default='VGG16 Feature Extraction + Cosine Similarity')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert model instance to dictionary"""
        return {
            'id': self.id,
            'similarity_score': self.similarity_score,
            'is_forgery': self.is_forgery,
            'confidence': self.confidence,
            'threshold_used': self.threshold_used,
            'status': self.status,
            'message': self.message,
            'analysis_method': self.analysis_method,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Analysis {self.id}: {self.status}>'

