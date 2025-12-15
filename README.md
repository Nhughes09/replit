# HHeuristics Proprietary Datasets App

A FastAPI application that generates, updates, and sells proprietary market research datasets in CSV format. The primary dataset tracks "AI & Tech News Sentiment" using the Finnhub API.

## Features
- **Dashboard**: View available datasets and download the latest CSVs.
- **Secure Access**: Protected by HTTP Basic Auth.
- **Automated Updates**: Daily data collection for major AI/Tech companies (NVDA, MSFT, GOOGL, META, AAPL, TSLA, AMD).

## Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nhughes09/replit.git
   cd replit
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Environment Variables**:
   You need a Finnhub API key.
   ```bash
   export FINNHUB_KEY="your_finnhub_key"
   ```

4. **Run the App**:
   ```bash
   uvicorn main:app --reload
   ```
   Visit `http://localhost:8000`.

5. **Run Data Update Manually**:
   ```bash
   python update_data.py
   ```

## Deployment on Render

This app is designed to be deployed on [Render.com](https://render.com).

### 1. Web Service Setup
- Connect your GitHub repository to Render.
- Create a new **Web Service**.
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
    - `FINNHUB_KEY`: Your Finnhub API Key.
    - `PYTHON_VERSION`: `3.11.0` (optional, handled by runtime.txt).

### 2. GitHub Actions (Free Cron) Setup
To keep the daily updates **free**, we use GitHub Actions instead of Render's paid Cron Jobs.

1.  Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2.  Click **New repository secret**.
3.  **Name**: `FINNHUB_KEY`
4.  **Value**: Your Finnhub API Key.
5.  Click **Add secret**.

The workflow is already set up in `.github/workflows/daily_update.yml`. It will:
- Run daily at 12:00 UTC.
- Fetch new data.
- Commit the updated CSV back to the repository.
- Render will detect the commit and automatically redeploy the website with the new data.

### 3. Live URL
The app will be accessible at: `https://replit-lml7.onrender.com`
