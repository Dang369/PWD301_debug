from functools import wraps
from flask import abort, flash, redirect, url_for, jsonify, request
from flask_login import current_user

def role_required(role_name):
    """
    Chapter 10: Custom Decorator kiểm tra vai trò (Role) của người dùng.
    Ví dụ: @role_required('ADMIN') hoặc @role_required('STAFF')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                if request.is_json or request.path.startswith('/api/'):
                    return jsonify({"error": "Unauthorized", "message": "Vui lòng đăng nhập"}), 401
                flash("Vui lòng đăng nhập để truy cập chức năng này!", "warning")
                return redirect(url_for('auth.login'))
            if current_user.role != role_name and current_user.role != 'ADMIN':
                if request.is_json or request.path.startswith('/api/'):
                    return jsonify({"error": "Forbidden", "message": f"Chỉ dành riêng cho quyền {role_name}"}), 403
                flash(f"Bạn không có quyền truy cập chức năng này! Cần quyền: {role_name}", "danger")
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    return role_required('ADMIN')(f)

def staff_required(f):
    return role_required('STAFF')(f)
