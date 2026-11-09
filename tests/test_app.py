import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from flask_app import create_app, db
from flask_app.models import User, Wallet

class CyberWebTestCase(unittest.TestCase):
    """
    Chapter 11: Unit Testing cho ứng dụng Web CyberZone
    Kiểm thử chức năng khởi tạo, REST API, mã hóa mật khẩu và thăng hạng
    """
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_homepage_status(self):
        """Kiểm thử route trang chủ trả về HTTP 200 OK (Chapter 2)"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_stations_api(self):
        """Kiểm thử REST API /api/stations trả về JSON hợp lệ (Chapter 9)"""
        response = self.client.get('/api/stations')
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertTrue(json_data['success'])
        self.assertGreaterEqual(json_data['total'], 6)

    def test_combos_api(self):
        """Kiểm thử REST API /api/combos trả về các gói combo giờ (Chapter 9)"""
        response = self.client.get('/api/combos')
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertTrue(json_data['success'])

    def test_user_password_hashing(self):
        """Kiểm thử bảo mật mật khẩu băm hash Werkzeug (Chapter 6)"""
        user = User(username='testgamer')
        user.set_password('Secret123')
        self.assertTrue(user.check_password('Secret123'))
        self.assertFalse(user.check_password('WrongPass'))

    def test_rank_progression(self):
        """Kiểm thử logic tự động tính toán thăng hạng Gamer Pass (Chapter 8)"""
        user = User(username='vipgamer')
        wallet = Wallet(user=user, balance=500000, total_deposited=500000)
        self.assertIn('SILVER', user.rank_info['name'])

        wallet.total_deposited = 1500000
        self.assertIn('GOLD', user.rank_info['name'])

if __name__ == '__main__':
    unittest.main()
