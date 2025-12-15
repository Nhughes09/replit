import os
import requests
import pandas as pd
from datetime import datetime, timedelta
import logging
import concurrent.futures
import random
import hashlib
from google_play_scraper import app as play_app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# 1. FINTECH CONFIG
FINTECH_APPS = {
    "Chime": "com.chime.mobile",
    "Revolut": "com.revolut.revolut",
    "N26": "de.number26.android",
    "Monzo": "co.uk.getmondo",
    "SoFi": "com.sofi.mobile"
}

# 2. AI TALENT CONFIG
AI_COMPANIES = ["OpenAI", "Anthropic", "Google DeepMind", "Meta AI", "Hugging Face"]

# 3. ESG CONFIG
ESG_COMPANIES = ["Tesla", "ExxonMobil", "Unilever", "BlackRock", "Patagonia"]

# 4. REGULATORY CONFIG
REG_BODIES = ["SEC", "FTC", "FDA", "EPA", "FCC"]

# 5. SUPPLY CHAIN CONFIG
SC_SECTORS = ["Semiconductors", "Automotive", "Pharma", "Rare Earths", "Logistics"]

def generate_event_id(prefix, date_str):
    raw = f"{prefix}{date_str}{random.randint(0,100000)}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]

# --- GENERATORS ---

def generate_fintech_data():
    """Generate Fintech Growth Digest."""
    events = []
    for name, pkg in FINTECH_APPS.items():
        # Real App Store Data
        try:
            result = play_app(pkg, lang='en', country='us')
            score = result.get('score', 0)
            reviews = result.get('reviews', 0)
            
            events.append({
                'event_id': generate_event_id(name, datetime.now().strftime('%Y%m%d')),
                'scraped_date': datetime.now().strftime('%Y-%m-%d'),
                'company': name,
                'event_type': 'app_metrics',
                'event_detail': f"Rating: {score:.1f}★, Reviews: {reviews:,}",
                'raw_metric': reviews,
                'growth_impact_score': min(10, int(score * 2)),
                'topic': 'user_acquisition',
                'sentiment_category': 'Positive' if score > 4.0 else 'Neutral'
            })
        except Exception as e:
            logger.error(f"Error fetching {name}: {e}")
            
    # Save
    df = pd.DataFrame(events)
    path = os.path.join(DATA_DIR, 'fintech_growth_digest.csv')
    if os.path.exists(path):
        pd.concat([pd.read_csv(path), df]).drop_duplicates(subset=['event_id']).to_csv(path, index=False)
    else:
        df.to_csv(path, index=False)
    return path

def generate_ai_talent_data():
    """Generate AI Talent Heatmap (Simulated)."""
    events = []
    for co in AI_COMPANIES:
        hiring_velocity = random.randint(5, 50)
        events.append({
            'event_id': generate_event_id(co, datetime.now().strftime('%Y%m%d')),
            'scraped_date': datetime.now().strftime('%Y-%m-%d'),
            'company': co,
            'event_type': 'job_postings',
            'event_detail': f"New AI Research roles: +{hiring_velocity}",
            'raw_metric': hiring_velocity,
            'sector_impact_score': min(10, hiring_velocity // 5),
            'topic': 'talent_acquisition',
            'sentiment_category': 'Positive'
        })
    
    df = pd.DataFrame(events)
    path = os.path.join(DATA_DIR, 'ai_talent_heatmap.csv')
    if os.path.exists(path):
        pd.concat([pd.read_csv(path), df]).drop_duplicates(subset=['event_id']).to_csv(path, index=False)
    else:
        df.to_csv(path, index=False)
    return path

def generate_esg_data():
    """Generate ESG Sentiment (Simulated)."""
    events = []
    for co in ESG_COMPANIES:
        score = random.randint(30, 90)
        events.append({
            'event_id': generate_event_id(co, datetime.now().strftime('%Y%m%d')),
            'scraped_date': datetime.now().strftime('%Y-%m-%d'),
            'company': co,
            'event_type': 'esg_report',
            'event_detail': f"Daily ESG Sentiment Score: {score}",
            'raw_metric': score,
            'esg_sentiment_score': score // 10,
            'topic': 'sustainability',
            'sentiment_category': 'Positive' if score > 60 else 'Negative'
        })
        
    df = pd.DataFrame(events)
    path = os.path.join(DATA_DIR, 'esg_sentiment_tracker.csv')
    if os.path.exists(path):
        pd.concat([pd.read_csv(path), df]).drop_duplicates(subset=['event_id']).to_csv(path, index=False)
    else:
        df.to_csv(path, index=False)
    return path

def generate_regulatory_data():
    """Generate Regulatory Risk (Simulated)."""
    events = []
    for body in REG_BODIES:
        risk_level = random.choice(["Low", "Medium", "High"])
        events.append({
            'event_id': generate_event_id(body, datetime.now().strftime('%Y%m%d')),
            'scraped_date': datetime.now().strftime('%Y-%m-%d'),
            'agency': body,
            'event_type': 'enforcement_action',
            'event_detail': f"Activity Level: {risk_level}",
            'raw_metric': 1 if risk_level == "Low" else 5 if risk_level == "Medium" else 10,
            'regulatory_urgency_score': 1 if risk_level == "Low" else 5 if risk_level == "Medium" else 10,
            'topic': 'compliance',
            'sentiment_category': 'Negative' if risk_level == "High" else 'Neutral'
        })
        
    df = pd.DataFrame(events)
    path = os.path.join(DATA_DIR, 'regulatory_risk_index.csv')
    if os.path.exists(path):
        pd.concat([pd.read_csv(path), df]).drop_duplicates(subset=['event_id']).to_csv(path, index=False)
    else:
        df.to_csv(path, index=False)
    return path

def generate_supply_chain_data():
    """Generate Supply Chain Risk (Simulated)."""
    events = []
    for sector in SC_SECTORS:
        disruption = random.randint(0, 100)
        events.append({
            'event_id': generate_event_id(sector, datetime.now().strftime('%Y%m%d')),
            'scraped_date': datetime.now().strftime('%Y-%m-%d'),
            'sector': sector,
            'event_type': 'disruption_alert',
            'event_detail': f"Disruption Index: {disruption}",
            'raw_metric': disruption,
            'liquidity_risk_score': disruption // 10,
            'topic': 'logistics',
            'sentiment_category': 'Negative' if disruption > 50 else 'Positive'
        })
        
    df = pd.DataFrame(events)
    path = os.path.join(DATA_DIR, 'supply_chain_risk.csv')
    if os.path.exists(path):
        pd.concat([pd.read_csv(path), df]).drop_duplicates(subset=['event_id']).to_csv(path, index=False)
    else:
        df.to_csv(path, index=False)
    return path

def update_dataset():
    """Run all 5 pipelines."""
    logger.info("Starting Multi-Vertical Data Pipeline...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(generate_fintech_data),
            executor.submit(generate_ai_talent_data),
            executor.submit(generate_esg_data),
            executor.submit(generate_regulatory_data),
            executor.submit(generate_supply_chain_data)
        ]
        concurrent.futures.wait(futures)
        
    logger.info("All datasets updated.")

if __name__ == "__main__":
    update_dataset()
