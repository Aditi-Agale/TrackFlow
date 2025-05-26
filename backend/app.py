from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

from models import db, Lead, Order, Document, Reminder, AutomationLog

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db.init_app(app)

with app.app_context():
    db.create_all()

# ---------------------- LEADS ----------------------

@app.route('/leads', methods=['POST'])
def add_lead():
    data = request.json
    lead = Lead(
        name=data['name'],
        contact=data['contact'],
        company=data['company'],
        product_interest=data['product_interest'],
        stage=data['stage'],
        follow_up_date=datetime.strptime(data['follow_up'], '%Y-%m-%d') if data['follow_up'] else None
    )
    db.session.add(lead)
    db.session.commit()

    if data['stage'] == 'Won':
        order = Order(lead_id=lead.id, status='Order Received')
        db.session.add(order)
        db.session.commit()

        automation = AutomationLog(action='Auto-created order from lead', status='success')
        db.session.add(automation)
        db.session.commit()

    return jsonify({'msg': 'Lead added'})


@app.route('/leads/<int:id>', methods=['PUT'])
def update_lead_stage(id):
    data = request.json
    lead = Lead.query.get_or_404(id)
    lead.stage = data['stage']
    db.session.commit()
    return jsonify({'msg': 'Lead stage updated'})


@app.route('/leads/<int:lead_id>/upload', methods=['POST'])
def upload_lead_document(lead_id):
    file = request.files.get('document')
    if not file:
        return jsonify({'error': 'No file provided'}), 400

    filename = file.filename
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)

    doc = Document(filename=filename, lead_id=lead_id)
    db.session.add(doc)
    db.session.commit()
    return jsonify({'msg': 'File uploaded for lead'})


@app.route('/leads/all')
def all_leads():
    leads = Lead.query.all()
    return jsonify([{
        'id': l.id,
        'name': l.name,
        'contact': l.contact,
        'company': l.company,
        'product_interest': l.product_interest,
        'stage': l.stage,
        'follow_up': l.follow_up_date.strftime('%Y-%m-%d') if l.follow_up_date else '',
        'documents': [d.filename for d in l.documents]
    } for l in leads])

# ---------------------- ORDERS ----------------------

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    order = Order(
        lead_id=data['lead_id'],
        status=data.get('status', 'Order Received'),
        courier=data.get('courier'),
        tracking_number=data.get('tracking_number')
    )
    db.session.add(order)
    db.session.commit()

    automation = AutomationLog(action='Order created manually or from automation', status='success')
    db.session.add(automation)
    db.session.commit()

    return jsonify({'msg': 'Order created'})


@app.route('/orders/<int:id>', methods=['PUT'])
def update_order(id):
    data = request.json
    order = Order.query.get_or_404(id)
    order.status = data.get('status', order.status)
    order.courier = data.get('courier', order.courier)
    order.tracking_number = data.get('tracking_number', order.tracking_number)
    db.session.commit()
    return jsonify({'msg': 'Order updated'})


@app.route('/orders/all')
def all_orders():
    orders = Order.query.all()
    return jsonify([{
        'id': o.id,
        'lead_id': o.lead_id,
        'status': o.status,
        'courier': o.courier,
        'tracking_number': o.tracking_number
    } for o in orders])

# ---------------------- DASHBOARD ----------------------

@app.route('/dashboard')
def dashboard():
    total_leads = Lead.query.count()
    open_leads = Lead.query.filter(Lead.stage.in_(['New', 'Contacted', 'Qualified', 'Proposal Sent'])).count()
    conversions = Lead.query.filter_by(stage='Won').count()
    orders_in_progress = Order.query.filter(Order.status != 'Dispatched').count()
    today = datetime.today().date()
    pending_followups = Lead.query.filter(Lead.follow_up_date != None, Lead.follow_up_date <= today).count()
    return jsonify({
        'total_leads': total_leads,
        'open_leads': open_leads,
        'conversions': conversions,
        'orders_in_progress': orders_in_progress,
        'pending_followups': pending_followups
    })

# ---------------------- REMINDERS ----------------------

@app.route('/reminders', methods=['POST'])
def set_reminder():
    data = request.json
    reminder = Reminder(
        message=data['message'],
        date=datetime.strptime(data['date'], '%Y-%m-%d'),
        lead_id=data.get('lead_id'),
        order_id=data.get('order_id')
    )
    db.session.add(reminder)
    db.session.commit()
    return jsonify({'msg': 'Reminder set'})


@app.route('/reminders/today')
def today_reminders():
    today = datetime.today().date()
    reminders = Reminder.query.filter(Reminder.date <= today, Reminder.sent == False).all()
    return jsonify([{
        'id': r.id,
        'message': r.message,
        'date': r.date.strftime('%Y-%m-%d'),
        'lead_id': r.lead_id,
        'order_id': r.order_id
    } for r in reminders])

# ---------------------- RUN APP ----------------------

if __name__ == '__main__':
    app.run(debug=True)
