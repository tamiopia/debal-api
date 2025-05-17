import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
import joblib
from datetime import datetime
import uuid
from enum import Enum
import random

# 1. Data Models and Enums
class Gender(Enum):
    MALE = 'male'
    FEMALE = 'female'
    NON_BINARY = 'non-binary'
    PREFER_NOT_TO_SAY = 'prefer-not-to-say'

class Religion(Enum):
    CHRISTIANITY = 'christianity'
    ISLAM = 'islam'
    HINDUISM = 'hinduism'
    JUDAISM = 'judaism'
    OTHER = 'other'
    NONE = 'none'

class PersonalityType(Enum):
    INTROVERT = 'introvert'
    EXTROVERT = 'extrovert'
    AMBIVERT = 'ambivert'

class SleepPattern(Enum):
    EARLY_BIRD = 'early-bird'
    NIGHT_OWL = 'night-owl'
    FLEXIBLE = 'flexible'

class LocationType(Enum):
    URBAN = 'urban'
    SUBURBAN = 'suburban'
    RURAL = 'rural'

class Hobby(Enum):
    READING = 'reading'
    SPORTS = 'sports'
    TRAVELLING = 'travelling'
    MUSIC = 'music'
    MOVIES = 'movies'
    GAMING = 'gaming'
    COOKING = 'cooking'
    ART = 'art'

class IncomeLevel(Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    VERY_HIGH = 'very-high'

class CleanlinessLevel(Enum):
    VERY_CLEAN = 'very-clean'
    CLEAN = 'clean'
    AVERAGE = 'average'
    MESSY = 'messy'

# 2. Mock Data Generator
class MockUserGenerator:
    @staticmethod
    def generate_mock_users(n=100000):
        users = []
        for _ in range(n):
            user = {
                'user_id': f'mock_{uuid.uuid4()}',
                'is_mock': True,
                'age': random.randint(18, 45),
                'gender': random.choice(list(Gender)).value,
                'occupation': random.choice(['Student', 'Engineer', 'Teacher', 'Doctor', 'Artist']),
                'religion': random.choice(list(Religion)).value,
                'smoking': random.choice(['Smoker', 'Non-smoker']),
                'personality_type': random.choice(list(PersonalityType)).value,
                'daily_routine': random.choice(['Regular 9-5', 'Flexible', 'Night shifts']),
                'sleep_pattern': random.choice(list(SleepPattern)).value,
                'preferred_location_type': random.choice(list(LocationType)).value,
                'commute_tolerance_minutes': random.randint(5, 120),
                'hobbies': random.sample([h.value for h in Hobby], random.randint(1, 4)),
                'income_level': random.choice(list(IncomeLevel)).value,
                'budget_range': random.choice(['low', 'medium', 'high']),
                'cleanliness_level': random.choice(list(CleanlinessLevel)).value,
                'chore_sharing_preference': random.choice(['share', 'separate']),
                'noise_tolerance': random.choice(['quiet', 'average', 'noisy']),
                'guest_frequency': random.choice(['never', 'rarely', 'sometimes', 'often']),
                'party_habits': random.choice(['never', 'rarely', 'sometimes', 'often']),
                'has_pets': random.choice(['yes', 'no']),
                'pet_tolerance': random.choice(['no-pets', 'cats', 'dogs', 'both']),
                'cooking_frequency': random.choice(['never', 'sometimes', 'often', 'always']),
                'diet_type': random.choice(['vegan', 'vegetarian', 'omnivore', 'pescatarian']),
                'shared_groceries': random.choice([True, False]),
                'work_hours': random.choice(['9-5', 'flexible', 'shift-work']),
                'works_from_home': random.choice([True, False]),
                'chronotype': random.choice(['early-bird', 'night-owl', 'flexible']),
                'privacy_level': random.choice(['high', 'medium', 'low']),
                'shared_space_usage': random.choice(['private', 'shared', 'both']),
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            users.append(user)
        return pd.DataFrame(users)

# 3. Feature Engineering Pipeline
class ProfileTransformer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.hobby_categories = [h.value for h in Hobby]
        
    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        X = X.copy()
        categorical_cols = [
            'gender', 'personality_type', 'sleep_pattern', 'preferred_location_type',
            'income_level', 'budget_range', 'cleanliness_level', 'noise_tolerance',
            'pet_tolerance', 'diet_type', 'work_hours', 'privacy_level'
        ]
        
        for col in categorical_cols:
            if col in X.columns:
                X[col] = X[col].apply(lambda x: x.value if isinstance(x, Enum) else x)
                X[col] = X[col].astype(str).replace('nan', 'unknown').replace('None', 'unknown')
        
        if 'hobbies' in X.columns:
            X['hobbies'] = X['hobbies'].apply(
                lambda x: [h.value if isinstance(h, Enum) else h for h in x] if isinstance(x, list) else []
            )
        
        X['schedule_compat'] = X.apply(self._calculate_schedule_compatibility, axis=1)
        X['lifestyle_compat'] = X.apply(self._calculate_lifestyle_compatibility, axis=1)
        X['living_habits_compat'] = X.apply(self._calculate_living_habits_compatibility, axis=1)
        
        numeric_cols = ['age', 'commute_tolerance_minutes', 'schedule_compat', 'lifestyle_compat', 'living_habits_compat']
        for col in numeric_cols:
            if col in X.columns:
                X[col] = X[col].fillna(X[col].median())
        
        return X
    
    def _calculate_schedule_compatibility(self, row):
        score = 0
        if row['sleep_pattern'] == row.get('match_sleep_pattern', row['sleep_pattern']):
            score += 0.4
        if row['work_hours'] == row.get('match_work_hours', row['work_hours']):
            score += 0.3
        if row['chronotype'] == row.get('match_chronotype', row['chronotype']):
            score += 0.3
        return score
    
    def _calculate_lifestyle_compatibility(self, row):
        score = 0
        if row['personality_type'] == row.get('match_personality', row['personality_type']):
            score += 0.3
        if row['noise_tolerance'] == row.get('match_noise_tolerance', row['noise_tolerance']):
            score += 0.2
        if row['guest_frequency'] == row.get('match_guest_frequency', row['guest_frequency']):
            score += 0.2
        if row['party_habits'] == row.get('match_party_habits', row['party_habits']):
            score += 0.2
        if row['privacy_level'] == row.get('match_privacy_level', row['privacy_level']):
            score += 0.1
        return score
    
    def _calculate_living_habits_compatibility(self, row):
        score = 0
        if row['cleanliness_level'] == row.get('match_cleanliness', row['cleanliness_level']):
            score += 0.4
        if row['chore_sharing_preference'] == row.get('match_chore_preference', row['chore_sharing_preference']):
            score += 0.3
        if row['shared_groceries'] == row.get('match_shared_groceries', row['shared_groceries']):
            score += 0.2
        if row['diet_type'] == row.get('match_diet_type', row['diet_type']):
            score += 0.1
        return score

# 4. Recommendation System
class RoommateRecommender:
    def __init__(self):
        self.user_data = pd.DataFrame()
        self.pipeline = self._build_pipeline()
        self.knn_model = None
        self.cluster_model = None
        
    def _build_pipeline(self):
        numeric_features = ['age', 'commute_tolerance_minutes', 'schedule_compat', 'lifestyle_compat', 'living_habits_compat']
        categorical_features = [
            'gender', 'personality_type', 'sleep_pattern', 'preferred_location_type',
            'income_level', 'budget_range', 'cleanliness_level', 'noise_tolerance',
            'pet_tolerance', 'diet_type', 'work_hours', 'privacy_level'
        ]
        
        transformer = ColumnTransformer([
            ('num', Pipeline([
                ('imputer', SimpleImputer(strategy='median')),
                ('scaler', StandardScaler())
            ]), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='infrequent_if_exist'), categorical_features),
            ('hobbies', self._hobby_encoder(), ['hobbies'])
        ])
        
        return Pipeline([
            ('features', ProfileTransformer()),
            ('preprocessor', transformer)
        ])
    
    class _hobby_encoder(BaseEstimator, TransformerMixin):
        def fit(self, X, y=None):
            self.hobby_categories = [h.value for h in Hobby]
            return self
            
        def transform(self, X):
            result = np.zeros((len(X), len(self.hobby_categories)))
            for i, hobbies in enumerate(X):
                if isinstance(hobbies, (list, np.ndarray)) and len(hobbies) > 0:
                    for hobby in (hobbies[0] if isinstance(hobbies[0], list) else hobbies):
                        if hobby in self.hobby_categories:
                            result[i, self.hobby_categories.index(hobby)] = 1
            return result
    
    def add_users(self, users_df, is_mock=False):
        users_df = users_df.copy()
        users_df['is_mock'] = is_mock
        if 'user_id' not in users_df.columns:
            users_df['user_id'] = [str(uuid.uuid4()) for _ in range(len(users_df))]
        
        now = datetime.now()
        if 'created_at' not in users_df.columns:
            users_df['created_at'] = now
        if 'updated_at' not in users_df.columns:
            users_df['updated_at'] = now
            
        self.user_data = pd.concat([self.user_data, users_df], ignore_index=True)
        
        if len(self.user_data) % 50 == 0:
            self.train_model()
    
    def add_real_user(self, user_data):
        user_df = pd.DataFrame([{
            **user_data,
            'is_mock': False,
            'user_id': str(uuid.uuid4()),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }])
        self.add_users(user_df, is_mock=False)
        return user_df.iloc[0]['user_id']
    
    def train_model(self):
        if len(self.user_data) < 10:
            return False
            
        X = self.pipeline.fit_transform(self.user_data)
        
        if np.isnan(X).any():
            X = np.nan_to_num(X)
        
        n_clusters = min(5, len(self.user_data)//10)
        self.cluster_model = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = self.cluster_model.fit_predict(X)
        self.user_data['cluster'] = clusters
        
        self.knn_model = NearestNeighbors(n_neighbors=min(20, len(self.user_data)), metric='cosine')
        self.knn_model.fit(X)
        
        return True
    
    def recommend(self, user_id, n=5, include_mock=True):
        if user_id not in self.user_data['user_id'].values:
            return []
            
        if self.knn_model is None:
            if not self.train_model():
                return []
        
        user = self.user_data[self.user_data['user_id'] == user_id].iloc[0]
        user_vec = self.pipeline.transform(pd.DataFrame([user]))
        
        if np.isnan(user_vec).any():
            user_vec = np.nan_to_num(user_vec)
        
        distances, indices = self.knn_model.kneighbors(user_vec)
        candidates = self.user_data.iloc[indices[0]].copy()
        
        candidates = candidates[candidates['user_id'] != user_id]
        if not include_mock:
            candidates = candidates[~candidates['is_mock']]
        
        if user['pet_tolerance'] == 'no-pets':
            candidates = candidates[candidates['has_pets'] == 'no']
        elif user['pet_tolerance'] in ['cats', 'dogs']:
            candidates = candidates[
                (candidates['has_pets'] == 'no') | 
                (candidates['pet_tolerance'] == user['pet_tolerance'])]
        
        if user.get('smoking', 'Non-smoker') == 'Non-smoker':
            candidates = candidates[candidates.get('smoking', 'Non-smoker') != 'Smoker']
        
        if len(candidates) > 0:
            candidate_vecs = self.pipeline.transform(candidates)
            if np.isnan(candidate_vecs).any():
                candidate_vecs = np.nan_to_num(candidate_vecs)
            candidates['compatibility_score'] = cosine_similarity(user_vec, candidate_vecs).flatten()
            return candidates.sort_values('compatibility_score', ascending=False).head(n).to_dict('records')
        
        return []

# 5. Testing and Evaluation with Accuracy Metrics
def evaluate_recommendation_quality(recommender):
    real_users = recommender.user_data[~recommender.user_data['is_mock']]
    if len(real_users) < 2:
        print("Need at least 2 real users for evaluation")
        return
    
    total_recommendations = 0
    good_recommendations = 0
    compatibility_scores = []
    cluster_consistency = 0
    
    for _, test_user in real_users.iterrows():
        recs = recommender.recommend(test_user['user_id'], n=5)
        
        if not recs:
            continue
            
        total_recommendations += len(recs)
        compatibility_scores.extend([r['compatibility_score'] for r in recs])
        
        test_cluster = test_user['cluster']
        same_cluster = sum(1 for r in recs if r['cluster'] == test_cluster)
        cluster_consistency += same_cluster / len(recs)
        
        good_recs = 0
        for rec in recs:
            pet_ok = (test_user['pet_tolerance'] == 'no-pets' and rec['has_pets'] == 'no') or \
                    (test_user['pet_tolerance'] in ['cats', 'dogs'] and 
                     (rec['has_pets'] == 'no' or rec['pet_tolerance'] == test_user['pet_tolerance']))
            
            smoking_ok = (test_user.get('smoking', 'Non-smoker') == 'Non-smoker' and 
                         rec.get('smoking', 'Non-smoker') != 'Smoker')
            
            if pet_ok and smoking_ok:
                good_recs += 1
                
        good_recommendations += good_recs
    
    if total_recommendations == 0:
        print("No recommendations generated for evaluation")
        return
    
    accuracy = good_recommendations / total_recommendations
    avg_compatibility = np.mean(compatibility_scores)
    cluster_consistency /= len(real_users)
    
    print("\nEvaluation Results:")
    print(f"- Total recommendations generated: {total_recommendations}")
    print(f"- Accuracy (meets basic criteria): {accuracy:.2%}")
    print(f"- Average compatibility score: {avg_compatibility:.2f}")
    print(f"- Cluster consistency: {cluster_consistency:.2%}")
    print(f"- Average recommendations per user: {total_recommendations/len(real_users):.1f}")

def test_recommendation_system():
    recommender = RoommateRecommender()
    
    # Generate mock data
    mock_users = MockUserGenerator.generate_mock_users(500)
    recommender.add_users(mock_users, is_mock=True)
    
    # Generate 50 real users with varied profiles
    real_user_profiles = [
        {
            'age': random.randint(20, 35),
            'gender': random.choice(list(Gender)).value,
            'occupation': random.choice(['Student', 'Engineer', 'Teacher', 'Doctor', 'Artist']),
            'personality_type': random.choice(list(PersonalityType)).value,
            'sleep_pattern': random.choice(list(SleepPattern)).value,
            'preferred_location_type': random.choice(list(LocationType)).value,
            'hobbies': random.sample([h.value for h in Hobby], random.randint(1, 3)),
            'income_level': random.choice(list(IncomeLevel)).value,
            'cleanliness_level': random.choice(list(CleanlinessLevel)).value,
            'pet_tolerance': random.choice(['no-pets', 'cats', 'dogs', 'both']),
            'diet_type': random.choice(['vegan', 'vegetarian', 'omnivore']),
            'smoking': random.choice(['Smoker', 'Non-smoker'])
        }
        for _ in range(50)
    ]
    
    for profile in real_user_profiles:
        recommender.add_real_user(profile)
    
    recommender.train_model()
    
    print("Evaluating recommendation accuracy...")
    evaluate_recommendation_quality(recommender)
    
    sample_user_id = recommender.user_data[~recommender.user_data['is_mock']].iloc[0]['user_id']
    print("\nSample recommendations for first real user:")
    recs = recommender.recommend(sample_user_id, n=3)
    for i, rec in enumerate(recs, 1):
        print(f"{i}. {rec['age']}yo {rec['gender']} {rec['occupation']} (Score: {rec['compatibility_score']:.2f})")

if __name__ == "__main__":
    test_recommendation_system()