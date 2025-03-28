# A very simple Flask Hello World app for you to get started with...
#FLASK_DEBUG=1 FLASK_APP=app.py flask run --host=0.0.0.0 --port=5000

from flask import Flask, render_template, request, jsonify, send_file, Response, session, send_from_directory, redirect,url_for
from classes.web.helper import Helper
from classes.web.json import json_data as j
import json
from classes.web.json import input_json as ij
import os
from core import output as op
from core import plan as pl
from datetime import datetime

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "lkmaslkdsldsamdlsdmaseewe2ldsmkdd"
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0  # Disable caching for development

# Add context processor for current year
@app.context_processor
def inject_year():
    return {'current_year': datetime.now().year}


@app.route('/home.html')
@app.route('/home')
def redirect_to_home():
    return redirect(url_for('home', _external=True), code=301)

@app.route('/')
def home():
    return render_template('marketing/landing.html')

@app.route('/test1')
def test1():
    return 'test'


@app.route('/plans.html')
def plans():
    return render_template('plans.html')

@app.route('/plan.html')
def plan():
    return render_template('plan.html')

@app.route('/planSubmit', methods=['POST'])
def planSubmit():
    try:
        data = request.json.get('jsonData')
        plan_data = j.Plan_Data.from_json(data)

        i=ij.InputJson(plan_data)
        i.process()
        exp=i.expenses
        la=i.funds
        strategic=i.strategic
        nla=i.incomes
        out= op.Excel(name="web_request",isPaymentAtBegin=i.isPaymentAtBegin,expenses=exp,liq_accts=la,nonliq_accts=nla)
        p = pl.Plan(i.isPaymentAtBegin, plan_data.current_age,i.current_calendar_year,exp,la,nla,out)
        p.set_strategic(strategic)
        year, lack_fund=p.execute_plan()
        out.close()

        # Fix: Use the correct path where the file is actually created
        filename='web_request.xlsx'
        
        if os.path.isfile(filename):
            print(f'File exists at: {os.path.abspath(filename)}')
        else:
            print(f'File not found at: {os.path.abspath(filename)}')
            return jsonify({'error': 'Generated file not found'})
            
        response = send_file(filename, as_attachment=True, mimetype='application/octet-stream')
        response.headers['Message'] = 'Successfully generated file'
        return response

    except Exception as e:
        print(f"  Errors")
        print(f"   exception: {str(e)}")
        return jsonify({'error': str(e)})

@app.route('/expenses.html')
def expenses():
    return render_template('expenses.html')

@app.route('/income.html')
def income():
    return render_template('income.html')

@app.route('/funds.html')
def funds():
    return render_template('funds.html')

@app.route('/strategic.html')
def strategic():
    return render_template('strategic.html')

@app.route('/showcase.html')
def showcase():
    return render_template('marketing/showcase.html')

@app.route('/privacy.html')
def privacy():
    return render_template('marketing/privacy.html')

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt')

if __name__ == '__main__':
    app.run(debug=True)
