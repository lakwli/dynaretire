# A very simple Flask Hello World app for you to get started with...
#FLASK_DEBUG=1 FLASK_APP=app.py flask run --host=0.0.0.0 --port=5005

from flask import Flask, render_template, request, jsonify, send_file, Response, session, send_from_directory, redirect, url_for, abort, after_this_request
from werkzeug.security import safe_join
from classes.web.helper import Helper
from classes.web.json import json_data as j
import json
from classes.web.json import input_json as ij
import os
from core import output as op
from core import plan as pl
from datetime import datetime
import random
from classes.content import blog_manager  # Import our blog manager
from classes.logging_config import initialize_logger

# Initialize logging
logger = initialize_logger()

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "lkmaslkdsldsamdlsdmaseewe2ldsmkdd"
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0  # Disable caching for development

# Error handler for all exceptions
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
    return jsonify({"error": "An internal error occurred"}), 500

# Add context processor for current year
@app.context_processor
def inject_year():
    return {'current_year': datetime.now().year}

# Request logging middleware
@app.before_request
def log_request():
    logger.info(f"Request to {request.path} [Method: {request.method}]")

# Blog routes
@app.route('/blog')
def blog_list():
    logger.info("Accessing blog list page")
    featured_blog, blog_posts = blog_manager.get_blog_list()
    return render_template('content/blog_list.html',
                          featured_blog=featured_blog,
                          blog_posts=blog_posts)

@app.route('/blog/<string:blog_id>')
def blog_post(blog_id):
    logger.info(f"Accessing blog post: {blog_id}")
    blog = blog_manager.get_article(blog_id)  # Function name unchanged for now
    if blog is None:
        logger.warning(f"Blog post not found: {blog_id}")
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



@app.route('/')
def home():
    return render_template('marketing/landing.html')

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
    logger.info("Starting plan submission")
    try:
        data = request.json.get('jsonData')
        plan_data = j.Plan_Data.from_json(data)

        random_number = str(random.randint(1000, 9999))
        fileGivenName=f"dynaretireResult{random_number}"

        logger.debug("Processing input data...")
        i=ij.InputJson(plan_data)
        i.process()
        exp=i.expenses
        la=i.funds
        strategic=i.strategic
        nla=i.incomes
        
        logger.debug("Generating Excel output...")
        out= op.Excel(name=fileGivenName,isPaymentAtBegin=i.isPaymentAtBegin,expenses=exp,liq_accts=la,nonliq_accts=nla)
        
        logger.debug("Executing retirement plan...")
        p = pl.Plan(i.isPaymentAtBegin, plan_data.current_age,i.current_calendar_year,exp,la,nla,out)
        p.set_strategic(strategic)
        year, lack_fund=p.execute_plan()
        out.close()

        # Fix: Use the correct path where the file is actually created
        filename=fileGivenName+'.xlsx'
        logger.info(f"Plan generated successfully: {filename}")
            
        # Function to clean up file after response
        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(filename):
                    os.remove(filename)
                    logger.debug(f"Cleaned up temporary file: {filename}")
            except Exception as e:
                logger.error(f"Error cleaning up file {filename}: {str(e)}")
            return response

        # Include the filename in the download to ensure browser uses the correct name
        response = send_file(filename, 
                           as_attachment=True, 
                           download_name=filename,
                           mimetype='application/octet-stream')
        response.headers['Message'] = 'Successfully generated file'
        return response

    except Exception as e:
        logger.error(f"Error in plan submission: {str(e)}", exc_info=True)
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

@app.route('/privacy')
def privacy():
    return render_template('marketing/privacy.html')

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt')

if __name__ == '__main__':
    logger.info("Starting DynaRetire application")
    app.run(debug=True)
