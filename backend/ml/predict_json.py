import sys
import json
import joblib
import pandas as pd
import os
import warnings
import gc

warnings.filterwarnings("ignore")

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return
            
        data = json.loads(input_data)
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_mid1_path = os.path.join(script_dir, 'model_mid1.pkl')
        model_mid2_path = os.path.join(script_dir, 'model_mid2.pkl')
        model_end_path = os.path.join(script_dir, 'model_end.pkl')
        
        if not (os.path.exists(model_mid1_path) and os.path.exists(model_mid2_path) and os.path.exists(model_end_path)):
            print(json.dumps({"error": "Model files not found"}))
            return
        
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        else:
            print(json.dumps({"error": "Invalid input format"}))
            return
            
        # Defaults
        if 'attendance' not in df.columns or pd.isna(df['attendance'].iloc[0]) or df['attendance'].iloc[0] == "":
            df['attendance'] = 75
        else:
            df['attendance'] = float(df['attendance'].iloc[0])
            
        if 'previous_cgpa' not in df.columns or pd.isna(df['previous_cgpa'].iloc[0]) or df['previous_cgpa'].iloc[0] == "":
            df['previous_cgpa'] = 7.0
        else:
            df['previous_cgpa'] = float(df['previous_cgpa'].iloc[0])
            
        if 'subject_difficulty' not in df.columns or pd.isna(df['subject_difficulty'].iloc[0]) or df['subject_difficulty'].iloc[0] == "":
            df['subject_difficulty'] = 5.0
        else:
            df['subject_difficulty'] = float(df['subject_difficulty'].iloc[0])
            
        # Handle 1st sem
        if df['previous_cgpa'].iloc[0] == 0:
            df['previous_cgpa'] = 7.0 # neutral
            
        # Predict Mid 1 if not provided
        provided_mid1 = 'mid_sem_1' in df.columns and pd.notna(df['mid_sem_1'].iloc[0]) and df['mid_sem_1'].iloc[0] != ""
        if not provided_mid1:
            model_mid1 = joblib.load(model_mid1_path)
            X1 = df[['attendance', 'previous_cgpa', 'subject_difficulty']]
            pred_mid1 = model_mid1.predict(X1)[0]
            df['mid_sem_1'] = pred_mid1
            del model_mid1
            gc.collect()
        else:
            df['mid_sem_1'] = float(df['mid_sem_1'].iloc[0])
            
        # Predict Mid 2 if not provided
        provided_mid2 = 'mid_sem_2' in df.columns and pd.notna(df['mid_sem_2'].iloc[0]) and df['mid_sem_2'].iloc[0] != ""
        if not provided_mid2:
            model_mid2 = joblib.load(model_mid2_path)
            X2 = df[['attendance', 'previous_cgpa', 'subject_difficulty', 'mid_sem_1']]
            pred_mid2 = model_mid2.predict(X2)[0]
            df['mid_sem_2'] = pred_mid2
            del model_mid2
            gc.collect()
        else:
            df['mid_sem_2'] = float(df['mid_sem_2'].iloc[0])
            
        # Internal marks
        provided_int = 'internal_marks' in df.columns and pd.notna(df['internal_marks'].iloc[0]) and df['internal_marks'].iloc[0] != ""
        if not provided_int:
            # Estimate internal marks based on attendance (max 20)
            df['internal_marks'] = (df['attendance'] / 100) * 20
        else:
            df['internal_marks'] = float(df['internal_marks'].iloc[0])
            
        # Predict End Sem
        model_end = joblib.load(model_end_path)
        X3 = df[['attendance', 'previous_cgpa', 'subject_difficulty', 'mid_sem_1', 'mid_sem_2', 'internal_marks']]
        pred_end = model_end.predict(X3)[0]
        del model_end
        gc.collect()
        
        total = df['mid_sem_1'].iloc[0] + df['mid_sem_2'].iloc[0] + df['internal_marks'].iloc[0] + pred_end
        
        print(json.dumps({
            "mid_sem_1_predicted": not provided_mid1,
            "mid_sem_1": round(float(df['mid_sem_1'].iloc[0]), 1),
            "mid_sem_2_predicted": not provided_mid2,
            "mid_sem_2": round(float(df['mid_sem_2'].iloc[0]), 1),
            "internal_predicted": not provided_int,
            "internal_marks": round(float(df['internal_marks'].iloc[0]), 1),
            "end_sem_predicted": True,
            "end_sem_marks": round(float(pred_end), 1),
            "total_marks": round(float(total), 1)
        }))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
