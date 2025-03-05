
# A very simple Flask Hello World app for you to get started with...
#FLASK_DEBUG=1 FLASK_APP=app.py flask run --host=0.0.0.0 --port=5000

from flask import Flask, render_template,request,jsonify, send_file, Response
from classes.web.helper import Helper
from classes.web.json import json_data as j
import json
from classes.web.json import input_json as ij
import os
from core import output as op
from core import plan as pl

app = Flask(__name__)
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "lkmaslkdsldsamdlsdmaseewe2ldsmkdd"
app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route('/')
def hello_world():
    return render_template('plans.html')


@app.route('/test1')
def test1():
    return 'test'

@app.route('/plans')
def plans():
    return render_template('plans.html')

@app.route('/plan')
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



@app.route('/expenses')
def expenses():
    return render_template('expenses.html')

@app.route('/income')
def income():
    return render_template('income.html')

@app.route('/funds')
def funds():
    return render_template('funds.html')

@app.route('/strategic')
def strategic():
    return render_template('strategic.html')

@app.route('/page', methods=["GET", "POST"])
def adder_page():
    errors = ""
    if "inputs" not in session:
        session["inputs"] = []
    if request.method == "POST":
        number1 = None
        number2 = None
        try:
            number1 = float(request.form["number1"])
            session["inputs"].append(number1)
            session.modified = True
        except:
            errors += "<p>{!r} is not a number.</p>\n".format(request.form["number1"])
        try:
            number2 = float(request.form["number2"])
        except:
            errors += "<p>{!r} is not a number.</p>\n".format(request.form["number2"])

        if number1 is not None and number2 is not None:
            result = session["inputs"]
            return '''
                <html>
                    <body>
                        <p>The result is {result}</p>
                        <p><a href="/page">Click here to calculate again</a>
                    </body>
                </html>
            '''.format(result=result)
    return '''
        <html>
            <body>
                <p>Enter your numbers:</p>
                <form method="post" action="./page">
                    <p><input name="number1" /></p>
                    <p><input name="number2" /></p>
                    <p><input type="submit" value="Do calculation" /></p>
                </form>
            </body>

        </html>
        '''
