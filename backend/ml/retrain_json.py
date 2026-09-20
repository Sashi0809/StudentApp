import sys
import json
import joblib
import pandas as pd
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import warnings

warnings.filterwarnings("ignore")

def main():
    print("--- 1. ML Retraining Started ---")
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return
            
        data = json.loads(input_data)
        if not data:
            print("No new data to train on. Exiting.")
            return

        new_df = pd.DataFrame(data)
        
        # Ensure new_df has required columns
        required_cols = ['attendance', 'previous_cgpa', 'subject_difficulty', 'internal_marks', 'mid_sem_1', 'mid_sem_2', 'end_sem_marks']
        missing_cols = [c for c in required_cols if c not in new_df.columns]
        if missing_cols:
            print(f"Missing columns in input data: {missing_cols}")
            return
            
        # Clean new data
        new_df = new_df[required_cols].fillna(0)
        
        # Handle 1st sem students (0 previous cgpa) by imputing with neutral median
        mask = (new_df['previous_cgpa'] == 0)
        if mask.any():
            median_val = new_df[new_df['previous_cgpa'] > 0]['previous_cgpa'].median()
            neutral = median_val if pd.notna(median_val) else 7.0
            new_df.loc[mask, 'previous_cgpa'] = neutral

        # Paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        historical_csv = os.path.join(script_dir, 'historical_data.csv')
        
        # Append to historical data
        if os.path.exists(historical_csv):
            hist_df = pd.read_csv(historical_csv)
            combined_df = pd.concat([hist_df, new_df], ignore_index=True)
            print(f"Loaded {len(hist_df)} historical records. Combined dataset size: {len(combined_df)}")
        else:
            combined_df = new_df
            print(f"No historical data found. Using new dataset size: {len(combined_df)}")
            
        # Save accumulated data back to CSV
        combined_df.to_csv(historical_csv, index=False)
        print("Updated historical_data.csv")
        
        # Train RF Models
        print("Training Random Forest models on the accumulated dataset...")
        
        # 1. Model for Mid Sem 1
        X1 = combined_df[['attendance', 'previous_cgpa', 'subject_difficulty']]
        y1 = combined_df['mid_sem_1']
        model_mid1 = Pipeline([('scaler', StandardScaler()), ('rf', RandomForestRegressor(n_estimators=100, random_state=42))])
        model_mid1.fit(X1, y1)
        
        # 2. Model for Mid Sem 2
        X2 = combined_df[['attendance', 'previous_cgpa', 'subject_difficulty', 'mid_sem_1']]
        y2 = combined_df['mid_sem_2']
        model_mid2 = Pipeline([('scaler', StandardScaler()), ('rf', RandomForestRegressor(n_estimators=100, random_state=42))])
        model_mid2.fit(X2, y2)
        
        # 3. Model for End Sem
        X3 = combined_df[['attendance', 'previous_cgpa', 'subject_difficulty', 'mid_sem_1', 'mid_sem_2', 'internal_marks']]
        y3 = combined_df['end_sem_marks']
        model_end = Pipeline([('scaler', StandardScaler()), ('rf', RandomForestRegressor(n_estimators=100, random_state=42))])
        model_end.fit(X3, y3)
        
        # Save Models
        joblib.dump(model_mid1, os.path.join(script_dir, 'model_mid1.pkl'))
        joblib.dump(model_mid2, os.path.join(script_dir, 'model_mid2.pkl'))
        joblib.dump(model_end, os.path.join(script_dir, 'model_end.pkl'))
        
        print(f"Successfully saved updated RF models: model_mid1.pkl, model_mid2.pkl, model_end.pkl")
        
    except Exception as e:
        print(f"Error during retraining: {str(e)}")

if __name__ == "__main__":
    main()
