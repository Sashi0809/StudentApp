import json
import random
import pandas as pd
import os

def generate_dummy_data_and_calculate_difficulty():
    # 1. Define subjects and their intrinsic (hidden) difficulty properties to generate realistic dummy data
    subjects_config = {
        "Intro to Art": {"mean_score": 85, "std_dev": 10},
        "Communication Skills": {"mean_score": 80, "std_dev": 12},
        "CSE101": {"mean_score": 70, "std_dev": 15},
        "Physics 101": {"mean_score": 60, "std_dev": 18},
        "Mathematics II": {"mean_score": 55, "std_dev": 20},
        "Advanced Algorithms": {"mean_score": 45, "std_dev": 25}, # Very hard
    }
    
    # Passing score threshold
    PASS_MARK = 40
    
    data = []
    
    # 2. Generate Dummy Dataset
    for subject, config in subjects_config.items():
        # Generate 500 student records per subject
        for student_id in range(1, 501):
            # Generate a score using normal distribution based on the subject's config
            score = int(random.gauss(config["mean_score"], config["std_dev"]))
            
            # Bound the score between 0 and 100
            score = max(0, min(100, score))
            
            # Determine pass/fail
            passed = score >= PASS_MARK
            
            data.append({
                "student_id": f"STU_{student_id:04d}",
                "subject": subject,
                "total_marks": score,
                "passed": passed
            })
            
    df = pd.DataFrame(data)
    print("--- Dummy Dataset Generated ---")
    print(df.head())
    print("\nDataset Shape:", df.shape)
    
    # 3. Algorithm to calculate difficulty
    # a. Calculate Failure Rate per subject
    failure_rates = df.groupby('subject')['passed'].apply(lambda x: 1.0 - x.mean())
    
    # b. Calculate Average Score Deficit
    global_avg_score = df['total_marks'].mean()
    subject_avgs = df.groupby('subject')['total_marks'].mean()
    score_deficits = global_avg_score - subject_avgs
    
    # c. Combine them into a raw difficulty score
    # We will weigh Failure Rate heavily (e.g., 70% weight) and Score Deficit (30% weight)
    # Normalize failure rate to 0-10
    failure_score = (failure_rates / failure_rates.max()) * 10
    
    # Normalize score deficit to 0-10 (Shift so minimum deficit is 0)
    min_deficit = score_deficits.min()
    shifted_deficits = score_deficits - min_deficit
    deficit_score = (shifted_deficits / shifted_deficits.max()) * 10
    
    final_difficulty = (0.7 * failure_score) + (0.3 * deficit_score)
    
    # Bound it cleanly between 1.0 and 10.0
    final_difficulty = final_difficulty.clip(lower=1.0, upper=10.0).round(2)
    
    difficulties_dict = final_difficulty.to_dict()
    
    print("\n--- Calculated Subject Difficulties ---")
    for sub, diff in difficulties_dict.items():
        print(f"{sub}: {diff}/10 (Failure Rate: {failure_rates[sub]*100:.1f}%, Avg Score: {subject_avgs[sub]:.1f})")
        
    # 4. Save to JSON for the ML model to use
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'subject_difficulties.json')
    
    with open(output_path, 'w') as f:
        json.dump(difficulties_dict, f, indent=2)
        
    print(f"\nSaved updated difficulties to {output_path}")

if __name__ == "__main__":
    generate_dummy_data_and_calculate_difficulty()
