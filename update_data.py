import os
import requests
import pandas as pd
from datetime import datetime, timedelta
import time

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
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        news_items = response.json()
        print(f"Fetched {len(news_items)} news items for {symbol}")
        return news_items
    except requests.exceptions.RequestException as e:
        print(f"Error fetching news for {symbol}: {e}")
        return []

def update_dataset():
    """Main function to update the AI sentiment dataset."""
    FINNHUB_KEY = os.environ.get("FINNHUB_KEY")
    if not FINNHUB_KEY:
        print("ERROR: FINNHUB_KEY environment variable is not set.")
        return
    
    SYMBOLS = ["NVDA", "MSFT", "GOOGL", "META", "AAPL", "TSLA", "AMD"]
    
    # Create data directory if it doesn't exist
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, 'ai_sentiment.csv')
    
    all_news = []
    for symbol in SYMBOLS:
        news = fetch_finnhub_news(FINNHUB_KEY, symbol)
        for item in news:
            processed_item = {
                'symbol': symbol,
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
        time.sleep(0.2)  # Be respectful to the free API rate limits
    
    if not all_news:
        print("No news data fetched. Exiting.")
        return
    
    new_df = pd.DataFrame(all_news)
    
    # Load existing data and append new, or create new file
    if os.path.exists(csv_path):
        try:
            existing_df = pd.read_csv(csv_path)
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            # Remove duplicates based on URL (most unique identifier)
            combined_df = combined_df.drop_duplicates(subset=['url'], keep='last')
        except Exception as e:
            print(f"Error reading existing CSV, creating new: {e}")
            combined_df = new_df
    else:
        combined_df = new_df
    
    # Save the updated dataset
    combined_df.to_csv(csv_path, index=False)
    print(f"Dataset updated successfully. Total records: {len(combined_df)}")

if __name__ == "__main__":
    update_dataset()
