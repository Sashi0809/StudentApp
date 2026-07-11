import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score
import joblib
import os

def main():
    print("--- Training Chained ML Models ---")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    historical_csv = os.path.join(script_dir, 'historical_data.csv')
    
    print(f"Loading dataset from {historical_csv}...")
    try:
        df = pd.read_csv(historical_csv)
    except Exception as e:
        print(f"Failed to load csv: {e}")
        return
        
    print(f"Dataset shape: {df.shape}")
    
    df = df.dropna()
    
    # 1. Model for Mid Sem 1
    features_mid1 = ['attendance', 'previous_cgpa', 'subject_difficulty']
    target_mid1 = 'mid_sem_1'
    X1 = df[features_mid1]
    y1 = df[target_mid1]
    
    model_mid1 = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    model_mid1.fit(X1, y1)
    
    # 2. Model for Mid Sem 2
    features_mid2 = ['attendance', 'previous_cgpa', 'subject_difficulty', 'mid_sem_1']
    target_mid2 = 'mid_sem_2'
    X2 = df[features_mid2]
    y2 = df[target_mid2]
    
    model_mid2 = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    model_mid2.fit(X2, y2)
    
    # 3. Model for End Sem
    features_end = ['attendance', 'previous_cgpa', 'subject_difficulty', 'mid_sem_1', 'mid_sem_2', 'internal_marks']
    target_end = 'end_sem_marks'
    X3 = df[features_end]
    y3 = df[target_end]
    
    model_end = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    model_end.fit(X3, y3)
    
    # Save Models
    joblib.dump(model_mid1, os.path.join(script_dir, 'model_mid1.pkl'))
    joblib.dump(model_mid2, os.path.join(script_dir, 'model_mid2.pkl'))
    joblib.dump(model_end, os.path.join(script_dir, 'model_end.pkl'))
    
    print("Saved model_mid1.pkl, model_mid2.pkl, model_end.pkl")
    
    # Evaluate
    print(f"Mid 1 R2: {r2_score(y1, model_mid1.predict(X1)):.2f}")
    print(f"Mid 2 R2: {r2_score(y2, model_mid2.predict(X2)):.2f}")
    print(f"End Sem R2: {r2_score(y3, model_end.predict(X3)):.2f}")
    print("Done!")

if __name__ == '__main__':
    main()
