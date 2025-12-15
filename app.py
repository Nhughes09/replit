from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import pandas as pd
import os
from datetime import datetime
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

@app.on_event("startup")
async def startup_event():
    """Run data update on startup."""
    logger.info("Triggering startup data pipeline...")
    try:
        from starlette.concurrency import run_in_threadpool
        await run_in_threadpool(update_dataset)
        logger.info("Startup pipeline completed.")
    except Exception as e:
        logger.error(f"Startup pipeline failed: {e}")

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    logger.info("Dashboard accessed")
    
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    digest_path = os.path.join(data_dir, 'fintech_growth_digest.csv')
    scores_path = os.path.join(data_dir, 'fintech_momentum_scores.csv')
    
    context = {
        "request": request,
        "total_events": 0,
        "companies_tracked": 0,
        "latest_update": "N/A",
        "momentum_leaders": [],
        "recent_events": []
    }
    
    # Load Digest (Events)
    if os.path.exists(digest_path):
        try:
            df_digest = pd.read_csv(digest_path)
            if not df_digest.empty:
                context["total_events"] = len(df_digest)
                context["companies_tracked"] = df_digest['company'].nunique()
                context["latest_update"] = df_digest['scraped_date'].max()
                context["recent_events"] = df_digest.sort_values('scraped_date', ascending=False).head(10).to_dict(orient='records')
        except Exception as e:
            logger.error(f"Error reading digest: {e}")

    # Load Scores (Momentum)
    if os.path.exists(scores_path):
        try:
            df_scores = pd.read_csv(scores_path)
            if not df_scores.empty:
                # Get latest day's scores
                latest_date = df_scores['date'].max()
                latest_scores = df_scores[df_scores['date'] == latest_date]
                context["momentum_leaders"] = latest_scores.sort_values('daily_momentum', ascending=False).head(5).to_dict(orient='records')
        except Exception as e:
            logger.error(f"Error reading scores: {e}")
    
    return templates.TemplateResponse("index.html", context)

@app.get("/download/digest")
async def download_digest():
    path = os.path.join(os.path.dirname(__file__), 'data', 'fintech_growth_digest.csv')
    if os.path.exists(path):
        return FileResponse(path, media_type='text/csv', filename=f"fintech_growth_digest_{datetime.now().strftime('%Y%m%d')}.csv")
    raise HTTPException(404, "File not found")

@app.get("/download/momentum")
async def download_momentum():
    path = os.path.join(os.path.dirname(__file__), 'data', 'fintech_momentum_scores.csv')
    if os.path.exists(path):
        return FileResponse(path, media_type='text/csv', filename=f"fintech_momentum_scores_{datetime.now().strftime('%Y%m%d')}.csv")
    raise HTTPException(404, "File not found")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
