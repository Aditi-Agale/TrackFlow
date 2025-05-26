from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    contact = db.Column(db.String(100))
    company = db.Column(db.String(100))
    product_interest = db.Column(db.String(100))
    stage = db.Column(db.String(50))
    follow_up_date = db.Column(db.Date)

    documents = db.relationship('Document', backref='lead', lazy=True)
    reminders = db.relationship('Reminder', backref='lead', lazy=True)
    orders = db.relationship('Order', backref='lead', lazy=True)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('lead.id'), nullable=False)
    status = db.Column(db.String(50), default='Order Received')
    courier = db.Column(db.String(100))
    tracking_number = db.Column(db.String(100))

    documents = db.relationship('Document', backref='order', lazy=True)
    reminders = db.relationship('Reminder', backref='order', lazy=True)


class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255))
    lead_id = db.Column(db.Integer, db.ForeignKey('lead.id'), nullable=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)


class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(255))
    date = db.Column(db.Date)
    sent = db.Column(db.Boolean, default=False)
    lead_id = db.Column(db.Integer, db.ForeignKey('lead.id'), nullable=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=True)


class AutomationLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(255))
    status = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
