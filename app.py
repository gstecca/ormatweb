from flask import Flask, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
   ormat_url = os.environ.get("ORIENTEERING_URL", "")
   return render_template('index.html', ormat_url=ormat_url)

if __name__ == '__main__':
   app.run(port=4205)
