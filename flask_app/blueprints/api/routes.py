from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from flask_app.models import User, Wallet
from flask_app.decorators import role_required, admin_required
from flask_app import db

api_bp = Blueprint('api', __name__)


@api_bp.route('/stations', methods=['GET'])
def get_stations():
    stations = [
        {"id": "STD-01", "name": "Standard Zone", "zone": "Standard", "rate": 12000, "status": "AVAILABLE"},
        {"id": "PRO-01", "name": "Cyber Pro 540Hz", "zone": "Pro", "rate": 18000, "status": "AVAILABLE"},
        {"id": "VIP-08", "name": "Ultra VIP Tầng 2", "zone": "VIP", "rate": 22000, "status": "OCCUPIED"},
        {"id": "ARENA-A1", "name": "Đấu Trường 5v5 IESF", "zone": "Arena", "rate": 25000, "status": "AVAILABLE"},
        {"id": "STREAM-01", "name": "Phòng Stream 4K", "zone": "Stream", "rate": 45000, "status": "AVAILABLE"},
        {"id": "BIDA-01", "name": "Bàn Bida Aileex King", "zone": "Bida", "rate": 79000, "status": "AVAILABLE"},
    ]
    return jsonify({
        "success": True,
        "total": len(stations),
        "data": stations
    }), 200

@api_bp.route('/combos', methods=['GET'])
def get_combos():
    combos = [
        {"id": "combo-1h", "name": "Gói 1 Giờ Chơi", "price": 20000, "bonus_minutes": 0, "tag": "Trải Nghiệm"},
        {"id": "combo-3h", "name": "Combo 3 Giờ Chiến", "price": 50000, "bonus_minutes": 15, "tag": "Tiết Kiệm 15%"},
        {"id": "combo-6h", "name": "Combo Cày Rank 6 Giờ", "price": 100000, "bonus_minutes": 45, "tag": "Hot Combo"},
        {"id": "combo-12h", "name": "Combo Thông Đêm 12 Giờ", "price": 200000, "bonus_minutes": 90, "tag": "Siêu Combo Đêm"},
    ]
    return jsonify({
        "success": True,
        "total": len(combos),
        "combos": combos
    }), 200

@api_bp.route('/user/profile', methods=['GET'])
@login_required
def get_user_profile():
    wallet = current_user.wallet
    return jsonify({
        "success": True,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "role": current_user.role,
            "balance": wallet.balance if wallet else 0,
            "total_deposited": wallet.total_deposited if wallet else 0,
            "rank": current_user.rank_info
        }
    }), 200

@api_bp.route('/topup', methods=['POST'])
@login_required
def api_topup():
    data = request.get_json() or {}
    try:
        amount = float(data.get('amount', 0))
    except (ValueError, TypeError):
        amount = 0

    if amount <= 0:
        return jsonify({
            "success": False,
            "error": "BAD_REQUEST",
            "message": "Số tiền nạp không hợp lệ (phải > 0)"
        }), 400

    wallet = current_user.wallet
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0, total_deposited=0.0)
        db.session.add(wallet)

    bonus = 0
    if amount >= 1000000:
        bonus = 600000
    elif amount >= 500000:
        bonus = 200000
    elif amount >= 200000:
        bonus = 50000

    wallet.balance += (amount + bonus)
    wallet.total_deposited += amount
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Nạp thành công {amount:,.0f}đ (+{bonus:,.0f}đ thưởng)",
        "new_balance": wallet.balance,
        "rank": current_user.rank_info
    }), 200

@api_bp.route('/admin/users', methods=['GET'])
@admin_required
def admin_get_users():
    users = User.query.all()
    return jsonify({
        "success": True,
        "count": len(users),
        "users": [{"id": u.id, "username": u.username, "role": u.role} for u in users]
    }), 200
