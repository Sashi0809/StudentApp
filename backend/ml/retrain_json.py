import sys
import json
import joblib
import pandas as pd
import os
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

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
        
        # Define features and target
        features = ['attendance', 'assignment_avg', 'mid_marks', 'internal_marks', 'subject_difficulty', 'previous_cgpa']
        target = 'passed'
        
        # Ensure new_df has required columns
        missing_cols = [c for c in features + [target] if c not in new_df.columns]
        if missing_cols:
            print(f"Missing columns in input data: {missing_cols}")
            return
            
        # Clean new data
        new_df = new_df[features + [target]].fillna(0)
        
        # Handle 1st sem students (0 previous cgpa) by imputing with neutral median
        mask = (new_df['previous_cgpa'] == 0)
        if mask.any():
            median_val = new_df[new_df['previous_cgpa'] > 0]['previous_cgpa'].median()
            neutral = median_val if pd.notna(median_val) else 7.0
            new_df.loc[mask, 'previous_cgpa'] = neutral

        # Scale new data from DB (10, 30, 10) UP to match historical data (100, 30, 30)
        new_df['assignment_avg'] = new_df['assignment_avg'] * 10
        new_df['internal_marks'] = new_df['internal_marks'] * 3

        # Paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        historical_csv = os.path.join(script_dir, 'historical_data.csv')
        model_path = os.path.join(script_dir, 'student_pass_model.pkl')
        
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
        
        X = combined_df[features]
        y = combined_df[target]
        
        # Train KNN Classifier (with feature scaling)
        model = Pipeline([
            ('scaler', StandardScaler()),
            ('knn', KNeighborsClassifier(n_neighbors=min(7, len(X)))) # Ensure k is not larger than samples
        ])
        
        print("Training model on the accumulated dataset...")
        model.fit(X, y)
        
        # Calculate training accuracy just for logging
        y_pred = model.predict(X)
        acc = accuracy_score(y, y_pred)
        print(f"Model Training Accuracy on full dataset: {acc:.4f}")
        
        # Save the model
        joblib.dump(model, model_path)
        print(f"Successfully saved updated model to {model_path}")
        
    except Exception as e:
        print(f"Error during retraining: {str(e)}")

if __name__ == "__main__":
    main()
