from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from flask_app.models import User, Wallet
from flask_app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if User.query.filter_by(username=username).first():
            flash('Tên đăng nhập đã tồn tại!', 'danger')
            return redirect(url_for('auth.register'))

        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        new_wallet = Wallet(user_id=new_user.id, balance=0.0, total_deposited=0.0)
        db.session.add(new_wallet)
        db.session.commit()

        flash('Đăng ký thành công! Hãy đăng nhập để nhận ưu đãi tân thủ.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('auth/register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            login_user(user)
            flash(f'Chào mừng {user.username} trở lại Cyber Zone!', 'success')
            return redirect(url_for('auth.profile'))
        else:
            flash('Sai tài khoản hoặc mật khẩu!', 'danger')

    return render_template('auth/login.html')

@auth_bp.route('/profile')
@login_required
def profile():
    return render_template('auth/profile.html', user=current_user)

@auth_bp.route('/topup', methods=['POST'])
@login_required
def topup():
    amount = float(request.form.get('amount', 0))
    if amount <= 0:
        flash('Số tiền nạp không hợp lệ!', 'danger')
        return redirect(url_for('auth.profile'))

    bonus = 0
    if amount >= 1000000:
        bonus = 600000
    elif amount >= 500000:
        bonus = 200000
    elif amount >= 200000:
        bonus = 50000

    wallet = current_user.wallet
    wallet.balance += (amount + bonus)
    wallet.total_deposited += amount
    db.session.commit()

    flash(f'Nạp thành công {amount:,.0f}đ! (Được thưởng thêm {bonus:,.0f}đ). Số dư ví hiện tại: {wallet.balance:,.0f}đ', 'success')
    return redirect(url_for('auth.profile'))

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Đã đăng xuất an toàn.', 'info')
    return redirect(url_for('auth.login'))