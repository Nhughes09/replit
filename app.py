from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
import os
import uvicorn
import logging
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
                    # To keep it fast, we'll just use file size and name parsing
                    size_mb = os.path.getsize(fpath) / (1024*1024)
                    rows = 0 # Expensive to count every time, maybe skip or estimate
                    
                    # Parse type from folder
                    p_type = dtype
                    
                    all_products[fpath] = {
                        'type': p_type,
                        'period': f.split('_')[-1].replace('.csv', ''), # Rough parse
                        'rows': "N/A", # Skip for speed
                        'size_mb': size_mb,
                        'price': manager.calculate_price(p_type, 1000), # Dummy row count for price
                        'description': f"{f.replace('_', ' ').title()}"
                    }

    catalog = manager.generate_catalog(all_products)
    
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
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "verticals": verticals
    })

@app.get("/download/{filename}")
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
