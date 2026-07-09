import sys
import json
import joblib
import pandas as pd
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'student_pass_model.pkl')
model = joblib.load(model_path)
data = {"attendance": 100, "assignment_avg": 9, "mid_marks": 28, "internal_marks": 9, "subject_difficulty": 8, "previous_cgpa": 8.0}
features = ['attendance', 'assignment_avg', 'mid_marks', 'internal_marks', 'subject_difficulty', 'previous_cgpa']
df = pd.DataFrame([data])

df['assignment_avg'] = df['assignment_avg'] * 10
df['internal_marks'] = df['internal_marks'] * 3

print(model.predict_proba(df[features])[:, 1] * 100)
