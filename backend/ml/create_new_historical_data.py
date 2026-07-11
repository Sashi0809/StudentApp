import pandas as pd
import numpy as np
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(script_dir, 'historical_data.csv')

# Generate 5000 realistic records
np.random.seed(42)
n = 5000

# Base student quality factor (0 to 1)
student_quality = np.random.beta(a=5, b=2, size=n)

# Attendance: 50% to 100%, correlated with quality
attendance = np.clip(student_quality * 50 + 50 + np.random.normal(0, 5, n), 50, 100).round()

# Previous CGPA: 5 to 10, correlated with quality. 10% 1st sem (0)
previous_cgpa = np.clip(student_quality * 5 + 5 + np.random.normal(0, 0.5, n), 5, 10).round(2)
is_first_sem = np.random.choice([True, False], p=[0.1, 0.9], size=n)
previous_cgpa[is_first_sem] = 0

# Subject difficulty: 5 to 10
subject_difficulty = np.random.uniform(5, 10, n).round(1)

# Difficulty factor (higher difficulty reduces marks slightly)
diff_factor = 1.0 - (subject_difficulty - 5) * 0.05

# Mid Sem 1 (Max 15)
mid_sem_1 = np.clip((student_quality * 15 * diff_factor) + np.random.normal(0, 2, n), 0, 15).round()

# Mid Sem 2 (Max 15), correlated with Mid Sem 1
mid_sem_2 = np.clip(mid_sem_1 + np.random.normal(0, 2, n), 0, 15).round()

# Internal Marks (Max 20), usually high for good attendance
internal_marks = np.clip((attendance / 100) * 20 + np.random.normal(0, 2, n), 0, 20).round()

# End Sem Marks (Max 50)
end_sem_marks = np.clip((student_quality * 50 * diff_factor) + np.random.normal(0, 5, n), 0, 50).round()

df = pd.DataFrame({
    'attendance': attendance,
    'previous_cgpa': previous_cgpa,
    'subject_difficulty': subject_difficulty,
    'internal_marks': internal_marks,
    'mid_sem_1': mid_sem_1,
    'mid_sem_2': mid_sem_2,
    'end_sem_marks': end_sem_marks
})

df.to_csv(output_file, index=False)
print(f"Generated {n} records to {output_file}")
