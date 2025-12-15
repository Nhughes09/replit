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

# Target Digital Banks (Android Package IDs)
TARGET_APPS = {
    "Chime": "com.chime.mobile",
    "Revolut": "com.revolut.revolut",
    "N26": "de.number26.android",
    "Monzo": "co.uk.getmondo",
    "Varo": "com.varomoney.bank",
    "SoFi": "com.sofi.mobile",
    "NuBank": "com.nu.production",
    "Current": "com.current.mobile"
}

# Finnhub Symbol Mapping (for News) - Some might be private, using closest proxies or general search
# Since many neobanks are private, we might search by name if Finnhub supports it, or stick to the ones that are public or have news.
# For this demo, we'll use the names to search news.
COMPANY_NAMES = list(TARGET_APPS.keys())

def generate_event_id(company, event_type, date_str):
    """Generate a unique ID for an event."""
    raw = f"{company}{event_type}{date_str}{random.randint(0,10000)}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]

def fetch_app_store_metrics(company, package_id):
    """Fetch app store metrics using google-play-scraper."""
    try:
        result = play_app(
            package_id,
            lang='en', # defaults to 'en'
            country='us' # defaults to 'us'
        )
        
        # Extract metrics
        score = result.get('score', 0)
        reviews = result.get('reviews', 0)
        # Rank is not directly available in this simple call without scraping charts, 
        # so we'll use rating/reviews as the proxy for "App Store Metrics"
        
        events = []
        
        # Event 1: Review Volume
        # In a real daily diff, we'd compare to yesterday. For now, we log the current state.
        events.append({
            'company': company,
            'event_type': 'review_volume',
            'event_detail': f"Total Reviews: {reviews:,} (Avg Rating: {score:.1f}★)",
            'source_url': result.get('url', ''),
            'raw_metric': reviews,
            'growth_impact_score': min(10, int(score * 2)) # Simple logic: higher rating = higher score
        })
        
        return events
    except Exception as e:
        logger.error(f"Error fetching app metrics for {company}: {e}")
        return []

def fetch_finnhub_news(api_key, company):
    """Fetch news for a company."""
    # Using general news search or company news if public. 
    # For private companies, Finnhub might not have ticker news. 
    # We'll use the 'news' endpoint with a query if possible, or just 'general' news filtered.
    # Actually, Finnhub's free tier is limited. We'll try 'company-news' for public ones (SoFi, Nu) 
    # and maybe skip or mock for private ones to avoid errors, OR use a general search proxy.
    # To keep it robust: We will only fetch for SoFi and NuBank properly, and mock/skip others or use a generic 'market news' as placeholder if needed.
    # BETTER: We'll use the 'search' endpoint or just stick to the ones we know work.
    # Let's try to fetch news for the public ones: SoFi, Nu.
    
    symbol_map = {"SoFi": "SOFI", "NuBank": "NU"}
    symbol = symbol_map.get(company)
    
    if not symbol:
        return []

    url = f"https://finnhub.io/api/v1/company-news"
    to_date = datetime.now().strftime('%Y-%m-%d')
    from_date = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
    
    params = {
        'symbol': symbol,
        'from': from_date,
        'to': to_date,
        'token': api_key
    }
    
    events = []
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            items = response.json()
            for item in items[:2]: # Limit to 2 news items per company per run
                events.append({
                    'company': company,
                    'event_type': 'financial_news',
                    'event_detail': item.get('headline', 'News Update'),
                    'source_url': item.get('url', ''),
                    'raw_metric': 0, # No specific metric for news
                    'growth_impact_score': 7 # Baseline score for news coverage
                })
    except Exception as e:
        logger.error(f"Error fetching news for {company}: {e}")
        
    return events

def calculate_scores(events):
    """Enrich events with scores and categories."""
    enriched = []
    for event in events:
        # Defaults
        topic = "general"
        sentiment = "Neutral"
        
        detail = event['event_detail'].lower()
        
        # Topic Logic
        if "review" in detail:
            topic = "engagement"
        elif "funding" in detail or "raised" in detail:
            topic = "funding"
            event['growth_impact_score'] = 9
        elif "launch" in detail or "feature" in detail:
            topic = "product_launch"
            event['growth_impact_score'] = 8
        elif "rank" in detail:
            topic = "user_acquisition"
            
        # Sentiment Logic (Simple keyword based)
        if any(x in detail for x in ["surge", "record", "high", "growth", "secured", "launch", "success"]):
            sentiment = "Positive"
        elif any(x in detail for x in ["drop", "loss", "fail", "lawsuit", "crash", "down"]):
            sentiment = "Negative"
            event['growth_impact_score'] = max(1, event['growth_impact_score'] - 5)
            
        event['topic'] = topic
        event['sentiment_category'] = sentiment
        event['event_id'] = generate_event_id(event['company'], event['event_type'], datetime.now().strftime('%Y%m%d'))
        event['scraped_date'] = datetime.now().strftime('%Y-%m-%d')
        
        enriched.append(event)
    return enriched

def update_dataset():
    """Main pipeline execution."""
    logger.info("Starting Fintech Growth Pipeline...")
    
    FINNHUB_KEY = os.environ.get("FINNHUB_KEY")
    
    all_raw_events = []
    
    # 1. Collect Data
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        # App Store Tasks
        future_apps = {executor.submit(fetch_app_store_metrics, name, pkg): name for name, pkg in TARGET_APPS.items()}
        
        # News Tasks (only for public ones)
        future_news = {executor.submit(fetch_finnhub_news, FINNHUB_KEY, name): name for name in ["SoFi", "NuBank"] if FINNHUB_KEY}
        
        for future in concurrent.futures.as_completed(future_apps):
            all_raw_events.extend(future.result())
            
        for future in concurrent.futures.as_completed(future_news):
            all_raw_events.extend(future.result())

    # 2. Enrich Data
    enriched_events = calculate_scores(all_raw_events)
    
    if not enriched_events:
        logger.warning("No events generated.")
        return

    # 3. Save Event Log (Digest)
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    digest_path = os.path.join(data_dir, 'fintech_growth_digest.csv')
    new_df = pd.DataFrame(enriched_events)
    
    # Columns order
    cols = ['event_id', 'scraped_date', 'company', 'event_type', 'event_detail', 'source_url', 'raw_metric', 'growth_impact_score', 'topic', 'sentiment_category']
    # Ensure all cols exist
    for c in cols:
        if c not in new_df.columns:
            new_df[c] = ""
    new_df = new_df[cols]

    if os.path.exists(digest_path):
        existing_df = pd.read_csv(digest_path)
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        combined_df = combined_df.drop_duplicates(subset=['event_id'])
    else:
        combined_df = new_df
        
    combined_df.to_csv(digest_path, index=False)
    logger.info(f"Saved Digest: {len(combined_df)} events.")

    # 4. Aggregation (Momentum Scores)
    # Calculate daily momentum per company
    # Formula: (SUM of score * 2) + (COUNT of events * 5). Cap at 100.
    
    today = datetime.now().strftime('%Y-%m-%d')
    daily_groups = combined_df[combined_df['scraped_date'] == today].groupby('company')
    
    momentum_data = []
    for company, group in daily_groups:
        score_sum = group['growth_impact_score'].sum()
        count = len(group)
        momentum = min(100, (score_sum * 2) + (count * 5))
        
        momentum_data.append({
            'date': today,
            'company': company,
            'daily_momentum': momentum,
            'weekly_momentum': momentum, # Placeholder for rolling avg
            'trend': '➡️ Stable' # Placeholder
        })
    
    if momentum_data:
        momentum_df = pd.DataFrame(momentum_data)
        scores_path = os.path.join(data_dir, 'fintech_momentum_scores.csv')
        
        if os.path.exists(scores_path):
            existing_scores = pd.read_csv(scores_path)
            # Append and dedupe
            final_scores = pd.concat([existing_scores, momentum_df], ignore_index=True)
            final_scores = final_scores.drop_duplicates(subset=['date', 'company'], keep='last')
        else:
            final_scores = momentum_df
            
        final_scores.to_csv(scores_path, index=False)
        logger.info(f"Saved Momentum Scores: {len(final_scores)} records.")

if __name__ == "__main__":
    update_dataset()
