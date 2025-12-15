from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import os
import uvicorn
import logging
import traceback
from update_data import update_dataset
from product_manager import DataProductManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI()
templates = Jinja2Templates(directory="templates")
manager = DataProductManager()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc), "trace": traceback.format_exc().splitlines()}
    )

@app.get("/debug")
async def debug_files():
    """Inspect the data directory."""
    files = []
    for root, dirs, filenames in os.walk("data"):
        for f in filenames:
            path = os.path.join(root, f)
            size = os.path.getsize(path)
            files.append({"path": path, "size": size})
    return {"files": files, "cwd": os.getcwd(), "listdir": os.listdir(".")}

@app.on_event("startup")
async def startup_event():
    """Run data update and segmentation on startup."""
    logger.info("Triggering startup data pipeline...")
    try:
        from starlette.concurrency import run_in_threadpool
        # 1. Generate Master Files
        await run_in_threadpool(update_dataset)
        
        # 2. Segment Files (Profitability Engine)
        # We assume master files are in data/
        masters = [
            ("fintech_growth_digest.csv", "fintech"),
            ("ai_talent_heatmap.csv", "ai_talent"),
            ("esg_sentiment_tracker.csv", "esg"),
            ("regulatory_risk_index.csv", "regulatory"),
            ("supply_chain_risk.csv", "supply_chain")
        ]
        
        for filename, p_type in masters:
            path = os.path.join("data", filename)
            if os.path.exists(path):
                manager.smart_split_csv(path, p_type)
                
        logger.info("Startup pipeline and segmentation completed.")
    except Exception as e:
        logger.error(f"Startup pipeline failed: {e}")

@app.get("/", response_class=HTMLResponse)
async def marketplace(request: Request):
    logger.info("Marketplace accessed")
    try:
        # Generate catalog from all subdirectories
        all_products = {}
        
        # Scan all product directories
        for dtype in ['bundles', 'yearly', 'quarterly', 'monthly']:
            dpath = os.path.join("data", dtype)
            if os.path.exists(dpath):
                for f in os.listdir(dpath):
                    if f.endswith(".csv"):
                        # Re-calculate info (or we could persist it, but this is simpler for now)
                        fpath = os.path.join(dpath, f)
                        # We need to reconstruct the metadata or just use file stats
                        # For this demo, we'll do a quick lookup or re-calc
                        # Calculate size
                        size_bytes = os.path.getsize(fpath)
                        if size_bytes < 1024 * 1024:
                            size_str = f"{size_bytes / 1024:.1f} KB"
                        else:
                            size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
                        
                        # Parse type from folder
                        p_type = dtype
                        
                        all_products[fpath] = {
                            'type': p_type,
                            'period': f.split('_')[-1].replace('.csv', ''), # Rough parse
                            'rows': "N/A", # Skip for speed
                            'size_str': size_str,
                            'price': manager.calculate_price(p_type, 1000), # Dummy row count for price
                            'description': f"{f.replace('_', ' ').title()}"
                        }

        # Update catalog with formatted size since manager might expect size_mb
        # Actually, manager.generate_catalog expects 'size_mb' in the dict to format it, 
        # OR we can just pass our pre-formatted string if we modify how we use it.
        # Let's look at product_manager.py or just override it here.
        # The manager.generate_catalog likely formats it again. 
        # Let's just manually build the catalog list here to be safe and simple, 
        # OR update the dict keys to match what the template expects.
        
        # Re-building catalog list manually to ensure 'size_str' is passed correctly
        catalog = []
        for filepath, info in all_products.items():
            catalog.append({
                'filename': os.path.basename(filepath),
                'type': info['type'],
                'period': info['period'],
                'size_str': info['size_str'],
                'description': info['description'],
                'download_url': f"/download/{os.path.basename(filepath)}"
            })
            
        # Sort by type (Bundle -> Yearly -> Quarterly -> Monthly)
        order = {'bundle': 0, 'yearly': 1, 'quarterly': 2, 'monthly': 3}
        catalog.sort(key=lambda x: (order.get(x['type'], 99), x['period']))
        
        # Group by Vertical for UI
        verticals = {
            "Fintech Growth": [],
            "AI Talent": [],
            "ESG Sentiment": [],
            "Regulatory Risk": [],
            "Supply Chain": []
        }
        
        for item in catalog:
            name = item['filename'].lower()
            if "fintech" in name: verticals["Fintech Growth"].append(item)
            elif "ai_talent" in name: verticals["AI Talent"].append(item)
            elif "esg" in name: verticals["ESG Sentiment"].append(item)
            elif "regulatory" in name: verticals["Regulatory Risk"].append(item)
            elif "supply" in name: verticals["Supply Chain"].append(item)
            
        # Product Metadata (The "Truth")
        vertical_info = {
            "Fintech Growth": {
                "description": "Tracks the velocity of Neobank adoption and market sentiment.",
                "methodology": "Aggregates daily app store ratings/reviews (Google Play) and financial news sentiment (Finnhub).",
                "frequency": "Daily (00:00 UTC)"
            },
            "AI Talent": {
                "description": "Monitors the migration of top research talent across major AI labs.",
                "methodology": "Tracks job posting velocity and research paper affiliations for OpenAI, Anthropic, DeepMind, etc.",
                "frequency": "Daily (00:00 UTC)"
            },
            "ESG Sentiment": {
                "description": "Quantifies public perception of corporate sustainability efforts.",
                "methodology": "NLP analysis of corporate ESG reports, press releases, and news coverage.",
                "frequency": "Daily (00:00 UTC)"
            },
            "Regulatory Risk": {
                "description": "Early warning system for enforcement actions and policy shifts.",
                "methodology": "Monitors press releases and enforcement logs from SEC, FTC, FDA, and EPA.",
                "frequency": "Daily (00:00 UTC)"
            },
            "Supply Chain": {
async def download_file(filename: str):
    # Search in all dirs
    for dtype in ['bundles', 'yearly', 'quarterly', 'monthly']:
        path = os.path.join("data", dtype, filename)
        if os.path.exists(path):
            return FileResponse(path, media_type='text/csv', filename=filename)
    raise HTTPException(404, "File not found")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
