import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

def generate_synthetic_study_data(n_samples=1200, seed=42):
    np.random.seed(seed)
    
    # 1. Study Hours: 5 to 100 hours
    study_hours = np.random.uniform(5, 100, n_samples)
    
    # 2. Tasks Completed: proportional to study hours with some variation
    tasks_completed = np.clip(np.random.poisson(lam=study_hours * 0.6), 1, 80)
    
    # 3. Completion Rate: 0.2 to 1.0
    completion_rate = np.clip(np.random.beta(a=5, b=2, size=n_samples), 0.2, 1.0)
    
    # 4. Avg Past Test Scores: 40 to 98
    avg_past_score = np.random.uniform(40, 98, n_samples)
    
    # 5. Days Studied: 1 to 45 days
    days_studied = np.random.randint(1, 45, n_samples)
    
    # Synthetic target score calculation formula with realistic weights & slight non-linearity
    # Base score built from past scores (40% weight) + study progress & consistency (60% weight)
    hours_factor = np.log1p(study_hours) / np.log1p(100) * 25  # up to 25 pts
    task_factor = completion_rate * 25                          # up to 25 pts
    past_score_factor = (avg_past_score / 100) * 40             # up to 40 pts
    consistency_factor = np.minimum(days_studied / 30.0, 1.0) * 10 # up to 10 pts
    
    noise = np.random.normal(0, 3.5, n_samples)
    
    raw_score = hours_factor + task_factor + past_score_factor + consistency_factor + noise
    final_score = np.clip(raw_score, 25.0, 100.0)
    
    df = pd.DataFrame({
        "study_hours": study_hours,
        "tasks_completed": tasks_completed,
        "completion_rate": completion_rate,
        "avg_past_score": avg_past_score,
        "days_studied": days_studied,
        "predicted_score": final_score
    })
    return df

def train_and_save_model():
    print("Generating synthetic study performance dataset...")
    df = generate_synthetic_study_data()
    
    X = df[["study_hours", "tasks_completed", "completion_rate", "avg_past_score", "days_studied"]]
    y = df["predicted_score"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=4,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    print("Model Training Complete!")
    print(f"Metrics -> R² Score: {r2:.4f} | MAE: {mae:.2f} | RMSE: {rmse:.2f}")
    
    # Save artifacts
    services_dir = os.path.join(os.path.dirname(__file__), "services")
    os.makedirs(services_dir, exist_ok=True)
    
    model_path = os.path.join(services_dir, "model.pkl")
    scaler_path = os.path.join(services_dir, "scaler.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    
    # Save CSV dataset file for inspection
    csv_path = os.path.join(os.path.dirname(__file__), "study_performance_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Saved dataset to {csv_path}")

    return model, scaler

if __name__ == "__main__":
    train_and_save_model()

