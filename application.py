import os
import re
import json
from flask import Flask, jsonify, render_template, request, url_for
from flask_jsglue import JSGlue

from cs50 import SQL

# configure application
app = Flask(__name__)
JSGlue(app)

# ensure responses aren't cached
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response

# configure CS50 Library to use SQLite database
db = SQL("sqlite:///doodles.db")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def data():
    with open('./static/butterfly.json') as json_data:
        d = json.load(json_data)
        print(d)
    return jsonify(d)