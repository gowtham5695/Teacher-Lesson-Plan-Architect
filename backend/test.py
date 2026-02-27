import google.generativeai as genai

# 🔴 PASTE YOUR REAL API KEY HERE
genai.configure(api_key="******************************")

models = genai.list_models()

for m in models:
    print(m.name, m.supported_generation_methods)
