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
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'ai_sentiment.csv')
    # Check if file exists and has more than just headers (approx check)
    if not os.path.exists(csv_path) or os.path.getsize(csv_path) < 100:
        logger.info("Dataset missing or empty on startup. Triggering initial data update...")
        # We run this directly to ensure data is available soon, but in a way that doesn't block too long if possible.
        # However, for the first run, blocking might be better to ensure data is there when user visits.
        # But to be safe against timeouts, we'll let it run.
        try:
            update_dataset()
        except Exception as e:
            logger.error(f"Startup update failed: {e}")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    logger.info("Home page accessed")
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/datasets")
async def datasets(request: Request, username: str = Depends(verify_user)):
    logger.info(f"Datasets page accessed by user: {username}")
    datasets_info = []
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'ai_sentiment.csv')
    
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            # Check if it's just headers
            if len(df) > 0:
                datasets_info.append({
                    "name": "AI & Tech Sentiment Tracker",
                    "records": len(df),
                    "updated": df['scraped_date'].max() if 'scraped_date' in df.columns else "N/A",
                    "download_url": "/download/ai"
                })
        except Exception as e:
            logger.error(f"Error reading dataset: {e}", exc_info=True)
    else:
        logger.warning(f"Dataset file not found at {csv_path}")
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "username": username,
        "datasets": datasets_info
    })

@app.get("/download/ai")
async def download_ai(username: str = Depends(verify_user)):
    logger.info(f"Download requested by user: {username}")
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'ai_sentiment.csv')
    if not os.path.exists(csv_path):
        logger.error("Download failed: Dataset not found")
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return FileResponse(
        csv_path,
        media_type='text/csv',
        filename=f"ai_sentiment_tracker_{datetime.now().strftime('%Y%m%d')}.csv"
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
