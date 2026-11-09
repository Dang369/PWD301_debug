import os
from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret')
    
    db_url = os.getenv('DATABASE_URL', 'sqlite:///cyber.db')
    if db_url and db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        if "pgbouncer=true" in db_url:
            db_url = db_url.replace("pgbouncer=true", "")
        db_url = db_url.rstrip('?&')
        if "sslmode=" not in db_url:
            db_url += ("&" if "?" in db_url else "?") + "sslmode=require"

        try:
            import psycopg2
            clean_dsn = db_url.replace("postgresql+psycopg2://", "postgresql://")
            conn = psycopg2.connect(clean_dsn, connect_timeout=2)
            conn.close()
        except Exception:
            db_url = 'sqlite:///cyber.db'

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    @app.route('/')
    def index():
        return render_template('index.html')

    from flask_app.blueprints.auth.routes import auth_bp
    from flask_app.blueprints.api.routes import api_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.before_request
    def before_request_middleware():
        """Middleware tiền xử lý: Bắt đầu phiên request, kiểm tra bảo mật"""
        pass

    @app.after_request
    def after_request_middleware(response):
        """Middleware hậu xử lý: Thêm security headers và log response"""
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response

    with app.app_context():
        from . import models
        db.create_all()

    return app
