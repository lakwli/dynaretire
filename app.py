# A very simple Flask Hello World app for you to get started with...
#FLASK_DEBUG=1 FLASK_APP=app.py flask run --host=0.0.0.0 --port=5005

from flask import Flask, render_template, request, jsonify, send_file, Response, session, send_from_directory, redirect, url_for, abort
from werkzeug.security import safe_join
from classes.web.helper import Helper
from classes.web.json import json_data as j
import json
from classes.web.json import input_json as ij
import os
from core import output as op
from core import plan as pl
from datetime import datetime
from classes.content import blog_manager  # Import our blog manager

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "lkmaslkdsldsamdlsdmaseewe2ldsmkdd"
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0  # Disable caching for development

# Add context processor for current year
@app.context_processor
def inject_year():
    return {'current_year': datetime.now().year}

# Blog routes
@app.route('/blog')
def blog_list():
    featured_blog, blog_posts = blog_manager.get_blog_list()
    return render_template('content/blog_list.html',
                          featured_blog=featured_blog,
                          blog_posts=blog_posts)

@app.route('/blog/<string:blog_id>')
def blog_post(blog_id):
    blog = blog_manager.get_article(blog_id)  # Function name unchanged for now
    if blog is None:
        abort(404)
    return render_template('content/blog_post.html', blog=blog)  # Pass as blog=

# Article routes for static content
@app.route('/articles/<path:article_path>')
def article(article_path):
    article = blog_manager.get_article_by_path(article_path)
    if article is None:
        abort(404)
    return render_template('content/article_post.html', article=article)

# Serve content files (images, etc.)
@app.route('/content/<path:filename>')
def content_files(filename):
    """Serve files from the content directory"""
    try:
        # Use safe_join to prevent directory traversal
        filepath = safe_join('content', filename)
        directory = os.path.dirname(filepath)
        filename = os.path.basename(filepath)
        return send_from_directory(directory, filename)
    except (TypeError, ValueError) as e:
        abort(404)

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
