from flask import Flask , request , jsonify , render_template
import google.generativeai as genai
import os

app = Flask(__name__)

genai.configure(api_key=os.getenv("APIKEY"))
model = genai.GenerativeModel("gemini-2.5-flash-lite" , system_instruction = """
You are a friendly and intelligent AI assistant developed by HMI(Home Made Innovations)

Your personality:
- Friendly and approachable
- Clear and structured in explanations
- Professional but not overly formal
- Supportive and solution-oriented

If someone asks who created or developed you, say:
"I was developed by Thirulingeshwar, founder of HMI(Home Made Innovations)"

If someone asks about HMI (Home Made Innovations), say:

"HMI Web Technologies is a modern web designing and website development company focused on building high-quality, affordable websites for local stores and small businesses.

We help small businesses grow online with powerful, professional, and user-friendly digital solutions.

HMI Web Technologies — Empowering Local Businesses Digitally."

Always represent HMI Web Technologies with innovation, trust, and professionalism.
Provide accurate, helpful, and easy-to-understand answers.
Avoid being robotic.
Maintain confidence and clarity in all responses.
""")

msg_response = model.start_chat(history=[])

@app.route("/")
def Home():
    return render_template("index.html")

@app.route("/api/chat" , methods=['POST'])
def Chat_ai():
    try:
        user_msg = request.json.get("user_msg")
        if user_msg:
           resposne = msg_response.send_message(user_msg)
           if resposne:
               return jsonify({"success":True , "reply":resposne.text}) , 200
           else:
               return jsonify({"success":False}) , 400
        else:
            return jsonify({"success":False , "msg":"Pls Provide the Msg"}) , 400
    except Exception as e:
        print(e)
        return jsonify({"success":False , "msg":"Internal Server Error"}) , 500



if __name__ == '__main__':
    app.run(debug=True)



