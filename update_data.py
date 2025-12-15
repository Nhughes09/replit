import os
import requests
import pandas as pd
from datetime import datetime, timedelta
import time
import logging
import concurrent.futures

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def fetch_finnhub_news(api_key, symbol):
    """Fetch news for a single symbol from Finnhub."""
    url = f"https://finnhub.io/api/v1/company-news"
    to_date = datetime.now().strftime('%Y-%m-%d')
    from_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    
    params = {
        'symbol': symbol,
        'from': from_date,
        'to': to_date,
        'token': api_key
    }
    
    try:
        logger.info(f"Fetching news for {symbol}...")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        news_items = response.json()
        logger.info(f"Successfully fetched {len(news_items)} news items for {symbol}")
        return symbol, news_items
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching news for {symbol}: {e}")
        return symbol, []

def update_dataset():
    """Main function to update the AI sentiment dataset."""
    logger.info("Starting dataset update process...")
    
    FINNHUB_KEY = os.environ.get("FINNHUB_KEY")
    if not FINNHUB_KEY:
        logger.error("FINNHUB_KEY environment variable is not set. Cannot fetch data.")
        return
    
    SYMBOLS = ["NVDA", "MSFT", "GOOGL", "META", "AAPL", "TSLA", "AMD"]
    
    # Create data directory if it doesn't exist
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, 'ai_sentiment.csv')
    
    all_news = []
    
    # Use ThreadPoolExecutor for parallel fetching
    # Finnhub free tier has rate limits, so we limit max_workers
    total_symbols = len(SYMBOLS)
    completed = 0
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_symbol = {executor.submit(fetch_finnhub_news, FINNHUB_KEY, symbol): symbol for symbol in SYMBOLS}
        
        for future in concurrent.futures.as_completed(future_to_symbol):
            symbol = future_to_symbol[future]
            completed += 1
            progress = int((completed / total_symbols) * 100)
            try:
                sym, news = future.result()
                logger.info(f"[{progress}%] Processed {sym}: Fetched {len(news)} items.")
                for item in news:
                    processed_item = {
                        'symbol': sym,
                        'headline': item.get('headline', ''),
                        'datetime': datetime.fromtimestamp(item.get('datetime', 0)).strftime('%Y-%m-%d %H:%M:%S') if item.get('datetime') else '',
                        'summary': item.get('summary', ''),
                        'source': item.get('source', ''),
                        'url': item.get('url', ''),
                        'sentiment_score': item.get('sentiment', 0),
                        'sector': 'AI/Tech',
                        'scraped_date': datetime.now().strftime('%Y-%m-%d')
                    }
                    all_news.append(processed_item)
            except Exception as e:
                logger.error(f"[{progress}%] Exception occurred while processing {symbol}: {e}")

    if not all_news:
        logger.warning("No news data fetched from any source. Exiting update.")
        return
    
    new_df = pd.DataFrame(all_news)
    
    # Load existing data and append new, or create new file
    if os.path.exists(csv_path):
        try:
            existing_df = pd.read_csv(csv_path)
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            # Remove duplicates based on URL (most unique identifier)
            combined_df = combined_df.drop_duplicates(subset=['url'], keep='last')
            logger.info(f"Appended new data. Combined records: {len(combined_df)}")
        except Exception as e:
            logger.error(f"Error reading existing CSV, creating new: {e}")
            combined_df = new_df
    else:
        combined_df = new_df
        logger.info(f"Created new dataset with {len(combined_df)} records.")
    
    # Save the updated dataset
    try:
        combined_df.to_csv(csv_path, index=False)
        logger.info(f"Dataset saved successfully to {csv_path}")
    except Exception as e:
        logger.error(f"Failed to save CSV: {e}")

if __name__ == "__main__":
    update_dataset()
