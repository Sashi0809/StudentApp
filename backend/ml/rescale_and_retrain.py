import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
import joblib
import os

def main():
    print("--- Rescaling Data and Retraining Model ---")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    original_excel = 'C:/Users/sashi/studentModel/dataset/student_performance_with_predictions.xlsx'
    historical_csv = os.path.join(script_dir, 'historical_data.csv')
    model_path = os.path.join(script_dir, 'student_pass_model.pkl')
    
    print(f"Loading original dataset from {original_excel}...")
    try:
        df = pd.read_excel(original_excel)
    except Exception as e:
        print(f"Failed to load excel: {e}")
        return
        
    print(f"Original dataset shape: {df.shape}")

    # Scale the columns
    print("Rescaling columns to new rubric...")
    # Assignment: 100 -> 10
    df['assignment_avg'] = (df['assignment_avg'] / 10).round(1)
    
    # Internal Marks: 30 -> 10
    df['internal_marks'] = (df['internal_marks'] / 3).round(1)
    
    # Mid Marks: keep out of 30
    df['mid_marks'] = df['mid_marks'].round(1)
    
    # Ensure missing previous_cgpa is imputed with median just in case
    if 'previous_cgpa' in df.columns:
        df['previous_cgpa'] = df['previous_cgpa'].fillna(df['previous_cgpa'].median())
    else:
        print("previous_cgpa not found in columns. Simulating a random column for training.")
        df['previous_cgpa'] = np.random.uniform(5.0, 10.0, len(df)).round(1)
    
    features = ['attendance', 'assignment_avg', 'mid_marks', 'internal_marks', 'subject_difficulty', 'previous_cgpa']
    target = 'passed'
    
    df = df.dropna(subset=features + [target])
    
    # Save the new rescaled dataset as historical_data.csv
    df.to_csv(historical_csv, index=False)
    print(f"Saved rescaled dataset to {historical_csv}")
    
    # Retrain Model
    X = df[features]
    y = df[target]
    
    model = Pipeline([
        ('scaler', StandardScaler()),
        ('knn', KNeighborsClassifier(n_neighbors=7))
    ])
    
    print("Training KNN Classifier on rescaled data...")
    model.fit(X, y)
    
    y_pred = model.predict(X)
    print(f"Accuracy on training set: {accuracy_score(y, y_pred):.4f}")
    
    # Save Model
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    print("Done!")

if __name__ == '__main__':
    main()
