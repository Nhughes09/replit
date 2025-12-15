from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import logging
import json
from datetime import datetime
from update_data import update_dataset
from product_manager import DataProductManager

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize Managers
data_manager = DataProductManager()

# Mount Static Files (React Build)
# We will mount 'assets' to /assets, and serve index.html for root
if os.path.exists("frontend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

@app.on_event("startup")
async def startup_event():
    """Run data pipeline on startup"""
    logger.info("Triggering startup data pipeline...")
    try:
        # Run the Premium Data Engine
        added_bytes = update_dataset()
        logger.info(f"Startup pipeline completed. Added {added_bytes} bytes.")
    except Exception as e:
        logger.error(f"Startup pipeline failed: {e}")

@app.get("/api/catalog")
async def get_catalog():
    """API Endpoint for React Frontend"""
    try:
        # 1. Get System Status
        data_dir = os.getenv("DATA_DIR", "data")
        status_path = os.path.join(data_dir, "status.json")
        if os.path.exists(status_path):
            with open(status_path, 'r') as f:
                system_status = json.load(f)
                # Format data added
                added = system_status.get('total_added_bytes', 0)
                if added > 1024 * 1024:
                    system_status['data_added'] = f"{added / (1024*1024):.2f} MB"
                else:
                    system_status['data_added'] = f"{added / 1024:.2f} KB"
        else:
            system_status = {"last_update": "Never", "data_added": "0 KB"}

        # 2. Generate Product Catalog
        verticals = {
            "Fintech Growth Intelligence": [],
            "AI Talent & Capital Prediction": [],
            "ESG Impact & Greenwashing Detector": [],
            "Regulatory Compliance Prediction": [],
            "Supply Chain Resilience Intelligence": []
        }
        
        # Map filenames to verticals
        product_map = {
            "fintech": "Fintech Growth Intelligence",
            "ai_talent": "AI Talent & Capital Prediction",
            "esg": "ESG Impact & Greenwashing Detector",
            "regulatory": "Regulatory Compliance Prediction",
            "supply_chain": "Supply Chain Resilience Intelligence"
        }

        # Scan for files
        for key, v_name in product_map.items():
            # Find bundle/yearly files
            # Note: We disabled monthly, so we look for what exists
            # We use the smart_split_csv logic to find generated files
            # Actually, simpler to just scan the directories
            
            # Check bundles
            for f in os.listdir(data_manager.dirs['bundles']):
                if f.startswith(key):
                    path = os.path.join(data_manager.dirs['bundles'], f)
                    verticals[v_name].append({
                        'description': 'Complete Historical Bundle',
                        'type': 'BUNDLE',
                        'size_mb': f"{os.path.getsize(path)/(1024*1024):.2f}",
                        'rows': 'All Time', # simplified
                        'download_url': f"/download/{f}"
                    })
            
            # Check yearly
            for f in os.listdir(data_manager.dirs['yearly']):
                if f.startswith(key):
                    path = os.path.join(data_manager.dirs['yearly'], f)
                    verticals[v_name].append({
                        'description': f"{f.split('_')[-1].replace('.csv','')} Full Year",
                        'type': 'YEARLY',
                        'size_mb': f"{os.path.getsize(path)/(1024*1024):.2f}",
                        'rows': '365 Days',
                        'download_url': f"/download/{f}"
                    })
            
            # Check quarterly
            for f in os.listdir(data_manager.dirs['quarterly']):
                if f.startswith(key):
                    path = os.path.join(data_manager.dirs['quarterly'], f)
                    verticals[v_name].append({
                        'description': f"{f.split('_')[-2]} {f.split('_')[-1].replace('.csv','')}",
                        'type': 'QUARTERLY',
                        'size_mb': f"{os.path.getsize(path)/(1024*1024):.2f}",
                        'rows': '90 Days',
                        'download_url': f"/download/{f}"
                    })

        return JSONResponse({
            "system_status": system_status,
            "verticals": verticals
        })
    except Exception as e:
        logger.error(f"Error rendering marketplace: {e}")
        logger.error(traceback.format_exc())
        raise e

@app.get("/api/preview/{vertical}")
async def get_preview(vertical: str):
    """Get preview data for a specific vertical"""
    try:
        data_dir = os.getenv("DATA_DIR", "data")
        
        # Map vertical slug to filename
        files = {
            "fintech": "fintech_growth_digest.csv",
            "ai_talent": "ai_talent_heatmap.csv",
            "esg": "esg_sentiment_tracker.csv",
            "regulatory": "regulatory_risk_index.csv",
            "supply_chain": "supply_chain_risk.csv"
        }
        
        if vertical not in files:
            raise HTTPException(404, "Vertical not found")
            
        fpath = os.path.join(data_dir, files[vertical])
        if not os.path.exists(fpath):
            # Fallback to local data dir if env var path is empty (e.g. local dev)
            fpath = os.path.join("data", files[vertical])
            if not os.path.exists(fpath):
                 return JSONResponse({"error": "Data not generated yet"}, status_code=404)
        
        # Read CSV with pandas
        import pandas as pd
        df = pd.read_csv(fpath)
        
        # Get last 30 days for charts
        history = df.tail(30).to_dict(orient='records')
        
        # Get latest row for "Live Signals"
        latest = df.iloc[-1].to_dict()
        
        return JSONResponse({
            "vertical": vertical,
            "latest": latest,
            "history": history,
            "total_rows": len(df)
        })
    except Exception as e:
        logger.error(f"Error fetching preview: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/api/download/{vertical}")
async def download_dataset(vertical: str):
    """Download the full CSV dataset for a vertical"""
    try:
        data_dir = os.getenv("DATA_DIR", "data")
        files = {
            "fintech": "fintech_growth_digest.csv",
            "ai_talent": "ai_talent_heatmap.csv",
            "esg": "esg_sentiment_tracker.csv",
            "regulatory": "regulatory_risk_index.csv",
            "supply_chain": "supply_chain_risk.csv"
        }
        
        if vertical not in files:
            raise HTTPException(404, "Vertical not found")
            
        fpath = os.path.join(data_dir, files[vertical])
        if not os.path.exists(fpath):
            fpath = os.path.join("data", files[vertical])
            if not os.path.exists(fpath):
                 raise HTTPException(404, "Dataset not found")
        
        return FileResponse(
            path=fpath, 
            filename=files[vertical], 
            media_type='text/csv', 
            headers={"Content-Disposition": f"attachment; filename={files[vertical]}"}
        )
    except Exception as e:
        logger.error(f"Error downloading dataset: {e}")
        raise HTTPException(500, str(e))

@app.get("/")
async def read_root():
    """Serve React App"""
    if os.path.exists("frontend/dist/index.html"):
        return FileResponse("frontend/dist/index.html")
    return HTMLResponse("<h1>Building Frontend... Please wait a moment and refresh.</h1>")

@app.get("/download/{filename}")
async def download_file(filename: str):
    # Search in all dirs
    data_dir = os.getenv("DATA_DIR", "data")
    for dtype in ['bundles', 'yearly', 'quarterly', 'monthly']:
        path = os.path.join(data_dir, dtype, filename)
        if os.path.exists(path):
            return FileResponse(path, media_type='text/csv', filename=filename)
    raise HTTPException(404, "File not found")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
