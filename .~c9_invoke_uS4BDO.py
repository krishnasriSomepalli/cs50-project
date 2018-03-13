import os
import re
import json
from flask import Flask, jsonify, render_template, request, url_for
from flask_jsglue import JSGlue
from random import *
from nltk.corpus import wordnet as wn
from nltk.tokenize import word_tokenize

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

@app.route("/basic")
def basic():
    return render_template("basic.html")

@app.route("/doodle")
def doodle():
    return render_template("doodle.html")

@app.route("/data")
def data():
    category = request.args.get('category')
    print(category)
    with open('./files/json/' + category + '.json') as json_data:
        d = json.load(json_data)
        data = []
        for i in range(0, 200):
            data.append(d[randint(0, len(d)-1)])
    return jsonify(data)

@app.route("/suggest")
def suggest():
    q = request.args.get('q') + '%'
    suggestions = db.execute("SELECT name FROM categories WHERE name LIKE :q", q = q)
    # if you get less than 5 suggestions, check the words in the dictionary for similar suggestions
    # check the synonyms of these matches to see if they are the synonyms of any categories
    # store these categories in a list and append them to suggestions if they are not already present
    # flag = 0 # if flag is 1, it indicates that synonym suggestions have been searched for already
    # if(len(suggestions) < 5 and flag == 0):
    #     # temp = r"'^' + request.args.get('q') + '[a-z]*'"
    #     flag = 1
    #     temp = r"^{}[a-z]*".format(request.args.get('q'))
    #     pattern = re.compile(temp)
    #     file = open("nouns", "r")
    #     nouns = word_tokenize(file.read())
    #     file.close()
    #     matches = []
    #     for noun in nouns:
    #         if pattern.match(noun):
    #             matches.append(noun)
    #     file = open("categories.txt", "r")
    #     categories = word_tokenize(file.read())
    #     file.close()
    #     suggests = set()
    #     for match in matches:
    #         synonyms = set()
    #         for synset in wn.synsets(match):
    #             for lemma in synset.lemmas():
    #                 synonyms.add(lemma.name())
    #         for synonym in synonyms:
    #             if synonym in categories:
    #                 suggests.add(synonym)
    #     suggestions.extend(suggests)

    return jsonify(suggestions)

@app.route("/test")
def test():
    return render_template("test.html")