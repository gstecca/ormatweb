from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
   return render_template('maplibresidebar.html')

if __name__ == '__main__':
   app.run(port=4211)