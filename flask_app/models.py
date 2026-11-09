from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from . import db, login_manager

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='MEMBER')  # ADMIN, STAFF, MEMBER
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    wallet = db.relationship('Wallet', backref='user', uselist=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def rank_info(self):
        total = self.wallet.total_deposited if self.wallet else 0.0
        if total >= 3000000:
            return {
                "name": "KIM CƯƠNG",
                "badge_color": "bg-cyan-500/20 text-cyan-400 border-cyan-400",
                "discount_pc": 20,
                "discount_fnb": 10,
                "icon": "fa-gem",
                "next_tier": None,
                "progress": 100
            }
        elif total >= 1000000:
            return {
                "name": "VÀNG (GOLD)",
                "badge_color": "bg-amber-500/20 text-amber-400 border-amber-400",
                "discount_pc": 10,
                "discount_fnb": 5,
                "icon": "fa-crown",
                "next_tier": "KIM CƯƠNG (Cần nạp thêm {:,.0f}đ)".format(3000000 - total),
                "progress": min(100, int((total / 3000000) * 100))
            }
        elif total >= 200000:
            return {
                "name": "BẠC (SILVER)",
                "badge_color": "bg-slate-500/20 text-slate-300 border-slate-300",
                "discount_pc": 5,
                "discount_fnb": 0,
                "icon": "fa-medal",
                "next_tier": "VÀNG (Cần nạp thêm {:,.0f}đ)".format(1000000 - total),
                "progress": min(100, int((total / 1000000) * 100))
            }
        else:
            return {
                "name": "ĐỒNG (TÂN THỦ)",
                "badge_color": "bg-amber-900/30 text-amber-600 border-amber-800",
                "discount_pc": 0,
                "discount_fnb": 0,
                "icon": "fa-shield",
                "next_tier": "BẠC (Cần nạp thêm {:,.0f}đ)".format(200000 - total),
                "progress": min(100, int((total / 200000) * 100))
            }

class Wallet(db.Model):
    __tablename__ = 'wallets'
    id = db.Column(db.Integer, primary_key=True)
    balance = db.Column(db.Float, default=0.0)             # Số dư khả dụng hiện tại
    total_deposited = db.Column(db.Float, default=0.0)     # Tổng tích lũy nạp từ trước đến nay để xét hạng
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)