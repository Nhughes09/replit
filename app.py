from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Cloudflare
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    except Exception as e:
        logger.error(f"Error fetching preview: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/api/files/{vertical}")
async def get_vertical_files(vertical: str):
    """Get list of downloadable files for a vertical"""
    try:
        data_dir = os.getenv("DATA_DIR", "data")
        
        # Map vertical to base filename
        base_map = {
            "fintech": "fintech_growth_digest",
            "ai_talent": "ai_talent_heatmap",
            "esg": "esg_sentiment_tracker",
            "regulatory": "regulatory_risk_index",
            "supply_chain": "supply_chain_risk"
        }
        
        if vertical not in base_map:
            raise HTTPException(404, "Vertical not found")
            
        base_name = base_map[vertical]
        files_list = []
        
        # Check for Yearly and Quarterly files
        # Pattern: {base_name}_2025_yearly.csv, {base_name}_2025_q1.csv, etc.
        
        # 1. Yearly
        yearly_name = f"{base_name}_2025_yearly.csv"
        y_path = os.path.join(data_dir, yearly_name)
        if os.path.exists(y_path):
            size_bytes = os.path.getsize(y_path)
            size_str = f"{size_bytes / (1024*1024):.2f} MB" if size_bytes > 1024*1024 else f"{size_bytes / 1024:.2f} KB"
            files_list.append({
                "name": "2025 Full Year",
                "filename": yearly_name,
                "size": size_str,
                "type": "YEARLY"
            })
            
        # 2. Quarterly
        for q in [1, 2, 3, 4]:
            q_name = f"{base_name}_2025_q{q}.csv"
            q_path = os.path.join(data_dir, q_name)
            if os.path.exists(q_path):
                size_bytes = os.path.getsize(q_path)
                size_str = f"{size_bytes / (1024*1024):.2f} MB" if size_bytes > 1024*1024 else f"{size_bytes / 1024:.2f} KB"
                files_list.append({
                    "name": f"2025 Q{q}",
                    "filename": q_name,
                    "size": size_str,
                    "type": "QUARTERLY"
                })
                
        return JSONResponse({"files": files_list})
    except Exception as e:
        logger.error(f"Error listing files: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/api/download/{filename}")
async def download_dataset(filename: str):
    """Download a specific CSV file"""
    try:
        data_dir = os.getenv("DATA_DIR", "data")
        fpath = os.path.join(data_dir, filename)
        
        # Security check: ensure no directory traversal
        if ".." in filename or "/" in filename:
             raise HTTPException(400, "Invalid filename")

        if not os.path.exists(fpath):
            # Fallback for local dev
            fpath = os.path.join("data", filename)
            if not os.path.exists(fpath):
                 raise HTTPException(404, "File not found")
        
        return FileResponse(
            path=fpath, 
            filename=filename, 
            media_type='text/csv', 
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"Error downloading file: {e}")
        raise HTTPException(500, str(e))

@app.get("/")
async def read_root():
    """Serve React App"""
    # If running locally with start_full_stack.sh, redirect to Vite
    if os.getenv("LOCAL_DEV") == "true":
        return HTMLResponse(
            "<h1>Redirecting to Local Frontend...</h1><script>window.location.href='http://localhost:5173'</script>"
        )

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
