import google.generativeai as genai
import os
import sys
import json
from dotenv import load_dotenv


load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')


def generate_keywords(payload):
    prompt = f"""
    Generate 12 short, SEO-friendly keywords related to '{payload['seed_keyword']}'.
    Each keyword should be 2-4 words long. Do not generate long sentences or questions.
    Return them as a single, comma-separated string.

    Example format: keyword one, keyword two, keyword three
    """
    response = model.generate_content(prompt)
    keywords = [k.strip() for k in response.text.split(',')]
    return {"keywords": keywords}

def generate_titles(payload):
    prompt = f"""
    Generate 10 engaging, SEO-optimized blog post titles for the keyword '{payload['keyword']}'.
    Return them as a list separated by the pipe character '|'.
    
    Example Format: Example Title One | Example Title Two | Example Title Three
    """
    response = model.generate_content(prompt)
    titles = [t.strip() for t in response.text.split('|')]
    return {"titles": titles}

def generate_outline(payload):
    prompt = f"Create a simple blog post outline for the title '{payload['title']}'. Use bullet points for the main sections."
    response = model.generate_content(prompt)
    return {"outline": response.text}

def generate_content(payload):
    prompt = f"Write a 150-word SEO-optimized introductory paragraph for a blog post titled '{payload['title']}' with the main keyword '{payload['keyword']}'. The paragraph should be based on this outline:\n\n{payload['outline']}"
    response = model.generate_content(prompt)
    score = 1 if payload['keyword'].lower() in response.text.lower() else 0
    return {"content": response.text, "seo_score": "Good" if score else "Needs Improvement"}


if __name__ == "__main__":
    step = sys.argv[1]
    payload_str = sys.argv[2]
    payload = json.loads(payload_str)
    
    result = {}
   
    if step == 'keywords':
        result = generate_keywords(payload)
    elif step == 'titles':
        result = generate_titles(payload)
    elif step == 'outline':
        result = generate_outline(payload)
    elif step == 'content':
        result = generate_content(payload)

    print(json.dumps(result))

