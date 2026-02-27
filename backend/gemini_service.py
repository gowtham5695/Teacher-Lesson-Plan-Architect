import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_lesson(topic, grade, duration_minutes: int = 40):

    model = genai.GenerativeModel("gemini-2.5-flash")

    # Build a time breakdown dynamically based on duration_minutes.
    # We'll create five segments where possible: intro, concept, activity, guided, assessment.
    intro_min = max(3, round(duration_minutes * 0.12))
    warmup_min = max(3, round(duration_minutes * 0.12))
    instruction_min = max(10, round(duration_minutes * 0.4))
    interactive_min = max(5, round(duration_minutes * 0.2))
    remaining = duration_minutes - (intro_min + warmup_min + instruction_min + interactive_min)
    assessment_min = max(1, remaining)

    prompt = f"""
You are an expert curriculum designer.

Generate a STRICTLY STRUCTURED {duration_minutes}-minute lesson plan in MARKDOWN FORMAT.

Topic: {topic}
Grade: {grade}

⚠️ IMPORTANT RULES:
- Follow exact section format
- Use clear headings
- Do NOT write extra commentary
- Keep it classroom-ready
- Keep explanations age-appropriate for Grade {grade}

FORMAT EXACTLY LIKE THIS:

# Lesson Plan: {topic}
## Grade: {grade}

---

## 1. Learning Objectives
- Objective 1
- Objective 2
- Objective 3

---

## 2. Teaching Technique (Best for Grade {grade})
Explain why this technique is suitable.

---

## 3. {duration_minutes}-Minute Time Breakdown

### 0–{intro_min} Minutes: Introduction
Describe teacher actions and student engagement.

### {intro_min}–{intro_min + instruction_min} Minutes: Concept Explanation
Clear explanation strategy.

### {intro_min + instruction_min}–{intro_min + instruction_min + interactive_min} Minutes: Interactive Activity
Detailed classroom activity.

### {intro_min + instruction_min + interactive_min}–{intro_min + instruction_min + interactive_min + assessment_min} Minutes: Assessment & Recap
Quick evaluation method.

---

## 4. Interactive Activity Details
Step-by-step instructions.

---

## 5. Quiz (With Answers)

1. Question  
   Answer:  

2. Question  
   Answer:  

3. Question  
   Answer:  

4. Question  
   Answer:  

5. Question  
   Answer:  

---

## 6. Assessment Strategy
How teacher evaluates learning.

---

## 7. Homework
Clear assignment for students.

Generate the complete lesson now.
"""

    response = model.generate_content(prompt)

    return response.text