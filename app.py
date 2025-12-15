from fastapi import FastAPI, Request, Depends, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import pandas as pd
import os
from datetime import datetime
import secrets
import uvicorn
import logging
from update_data import update_dataset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI()
templates = Jinja2Templates(directory="templates")
security = HTTPBasic()

# Basic Auth
def verify_user(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, "hheuristics2025")
    if not (correct_username and correct_password):
        logger.warning(f"Failed login attempt for user: {credentials.username}")
        raise HTTPException(
            status_code=401,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.on_event("startup")
async def startup_event():
    """Run data update on startup if dataset is missing."""
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'ai_sentiment_enhanced.csv')
    if not os.path.exists(csv_path) or os.path.getsize(csv_path) < 100:
        logger.info("Enhanced dataset missing or empty on startup. Triggering initial data update...")
        try:
            from starlette.concurrency import run_in_threadpool
            await run_in_threadpool(update_dataset)
            logger.info("Startup data update completed successfully.")
        except Exception as e:
            logger.error(f"Startup update failed: {e}")

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request, username: str = Depends(verify_user)):
    logger.info(f"Dashboard accessed by user: {username}")
    
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'ai_sentiment_enhanced.csv')
    
    metrics = {
        "total_articles": 0,
        "unique_companies": 0,
        "last_update": "N/A",
        "sentiment_summary": {"Positive": 0, "Neutral": 0, "Negative": 0},
        "sample_data": []
    }
    
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            if len(df) > 0:
                metrics["total_articles"] = len(df)
                metrics["unique_companies"] = df['symbol'].nunique()
                metrics["last_update"] = df['scraped_date'].max()
                
                # Sentiment Summary
                sentiment_counts = df['sentiment_category'].value_counts().to_dict()
                metrics["sentiment_summary"] = {
                    "Positive": sentiment_counts.get("Positive", 0),
                    "Neutral": sentiment_counts.get("Neutral", 0),
                    "Negative": sentiment_counts.get("Negative", 0)
                }
                
                # Sample Data (First 10 rows)
                # Convert to list of dicts for Jinja2
                metrics["sample_data"] = df.head(10).to_dict(orient='records')
                
        except Exception as e:
            logger.error(f"Error reading dataset: {e}", exc_info=True)
    else:
        logger.warning(f"Dataset file not found at {csv_path}")
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "username": username,
        "metrics": metrics
    })

@app.get("/download")
async def download_dataset(username: str = Depends(verify_user)):
    logger.info(f"Download requested by user: {username}")
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'ai_sentiment_enhanced.csv')
    if not os.path.exists(csv_path):
        logger.error("Download failed: Dataset not found")
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    filename = f"hheuristics_ai_sentiment_{datetime.now().strftime('%Y-%m-%d')}.csv"
    
    return FileResponse(
        csv_path,
        media_type='text/csv',
        filename=filename
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
