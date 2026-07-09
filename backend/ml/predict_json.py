import sys
import json
import joblib
import pandas as pd
import os

def main():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return
            
        data = json.loads(input_data)
        
        # Determine model path relative to this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'student_pass_model.pkl')
        
        if not os.path.exists(model_path):
            print(json.dumps({"error": "Model file not found"}))
            return
            
        # Load the model
        model = joblib.load(model_path)
        
        # Extract features
        features = ['attendance', 'assignment_avg', 'mid_marks', 'internal_marks', 'subject_difficulty', 'previous_cgpa']
        
        # Convert input dictionary to DataFrame
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            print(json.dumps({"error": "Invalid input format"}))
            return
            
        # Ensure all features exist
        for f in features:
            if f not in df.columns:
                df[f] = 0
                
        X_new = df[features].copy()
        
        # Neglect previous_cgpa for 1st sem students (where cgpa is 0 or null)
        # We do this by replacing 0 with the neutral median CGPA so it doesn't penalize them.
        mask = (X_new['previous_cgpa'] == 0) | (X_new['previous_cgpa'].isna())
        if mask.any():
            neutral_cgpa = 7.0
            hist_path = os.path.join(script_dir, 'historical_data.csv')
            if os.path.exists(hist_path):
                try:
                    hist_df = pd.read_csv(hist_path)
                    if 'previous_cgpa' in hist_df.columns:
                        median_val = hist_df[hist_df['previous_cgpa'] > 0]['previous_cgpa'].median()
                        if pd.notna(median_val):
                            neutral_cgpa = median_val
                except Exception:
                    pass
            X_new.loc[mask, 'previous_cgpa'] = neutral_cgpa
            
        X_new = X_new.fillna(0)
        
        # SCALE INPUTS TO MATCH ORIGINAL MODEL EXPECTATIONS
        # The frontend accepts 10 (assignment), 30 (mid), 10 (internal)
        # But the original model was trained on 100, 30, 30.
        X_new['assignment_avg'] = X_new['assignment_avg'] * 10
        X_new['internal_marks'] = X_new['internal_marks'] * 3
        
        # Predict
        pass_probabilities = model.predict_proba(X_new)[:, 1] * 100
        
        # Return results
        results = pass_probabilities.round(2).tolist()
        
        if isinstance(data, dict):
            print(json.dumps({"predicted_passing_percentage": results[0]}))
        else:
            print(json.dumps({"predicted_passing_percentages": results}))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
