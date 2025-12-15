---
title: HHeuristics Datasets
emoji: 📊
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

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

## Deployment on Hugging Face Spaces

This app is optimized for **Hugging Face Spaces** (Docker SDK).

### 1. Create a Space
1.  Go to [huggingface.co/new-space](https://huggingface.co/new-space).
2.  **Name**: `hheuristics-datasets` (or similar).
3.  **SDK**: Select **Docker**.
4.  **Template**: Select **Blank**.
5.  **Space Hardware**: Free (CPU basic) is sufficient.

### 2. Connect Repository
You can either:
-   **Sync with GitHub**: In the Space settings, connect this GitHub repository.
-   **Direct Push**: Add the Space as a remote and push directly:
    ```bash
    git remote add space https://huggingface.co/spaces/YOUR_USERNAME/SPACE_NAME
    git push space main
    ```

### 3. Environment Variables
1.  Go to your Space's **Settings** tab.
2.  Scroll to **Variables and secrets**.
3.  Add a **Secret**:
    -   Key: `FINNHUB_KEY`
    -   Value: Your Finnhub API Key.

### 4. Background Updates
The GitHub Action (`.github/workflows/daily_update.yml`) will still handle the daily data updates for free! It pushes the new data to GitHub, which will trigger a rebuild of your Space if you have connected them.

