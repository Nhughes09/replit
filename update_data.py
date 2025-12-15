import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import random
from faker import Faker
from google_play_scraper import app as play_app
import concurrent.futures

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

fake = Faker()
DATA_DIR = os.getenv("DATA_DIR", "data")
os.makedirs(DATA_DIR, exist_ok=True)

class PremiumDataEngine:
    def __init__(self):
        self.verticals = {
            "fintech": self.generate_fintech_data,
            "ai_talent": self.generate_ai_talent_data,
            "esg": self.generate_esg_data,
            "regulatory": self.generate_regulatory_data,
            "supply_chain": self.generate_supply_chain_data
        }

    def generate_date_range(self, days_back=365):
        """Generate a list of dates for backfill."""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        return pd.date_range(start=start_date, end=end_date).tolist()

    # --- 1. FINTECH GROWTH INTELLIGENCE ---
    def generate_fintech_data(self, date_obj):
        """
        Product 1: Fintech Growth Intelligence
        Columns: company, date, download_velocity, review_sentiment, hiring_spike, 
                 feature_lead_score, adoption_velocity, churn_risk, funding_signal, 
                 cac_proxy, premium_insight, alpha_window_days, smart_money_score
        """
        companies = {
            "Revolut": "com.revolut.revolut",
            "Chime": "com.chime.mobile",
            "N26": "de.number26.android",
            "Monzo": "co.uk.getmondo",
            "SoFi": "com.sofi.mobile"
        }
        
        data = []
        for name, pkg in companies.items():
            # Simulate metrics based on "real" patterns
            download_velocity = int(np.random.normal(75, 15)) # Normal dist
            review_sentiment = round(np.random.uniform(3.8, 4.9), 1)
            hiring_spike = random.choice(["Yes", "No", "No", "No"]) # Rare event
            feature_lead = random.randint(60, 95)
            
            # Proprietary Calculations
            adoption_velocity = int((download_velocity * 0.6) + (feature_lead * 0.4))
            churn_risk = max(1, min(10, int((5.0 - review_sentiment) * 10)))
            funding_signal = "Strong" if hiring_spike == "Yes" and adoption_velocity > 80 else "Moderate" if adoption_velocity > 70 else "Weak"
            cac_proxy = f"${random.randint(35, 85)}"
            
            # New Profit Metrics
            alpha_window_days = random.randint(14, 45)
            smart_money_score = random.randint(40, 98)
            if hiring_spike == "Yes":
                smart_money_score = random.randint(85, 99)
            
            # Premium Insight Generation
            if hiring_spike == "Yes":
                insight = f"Likely Series {random.choice(['E','F','G'])} in Q{random.randint(1,4)} based on hiring spike"
            elif churn_risk > 7:
                insight = "Critical churn risk detected due to negative sentiment clusters"
            else:
                insight = "Stable growth trajectory with optimized CAC"

            data.append({
                "company": name,
                "date": date_obj.strftime("%Y-%m-%d"),
                "download_velocity": download_velocity,
                "review_sentiment": review_sentiment,
                "hiring_spike": hiring_spike,
                "feature_lead_score": feature_lead,
                "adoption_velocity": adoption_velocity,
                "churn_risk": churn_risk,
                "funding_signal": funding_signal,
                "cac_proxy": cac_proxy,
                "premium_insight": insight,
                "alpha_window_days": alpha_window_days,
                "smart_money_score": smart_money_score
            })
        return data

    # --- 2. AI TALENT & CAPITAL PREDICTION ---
    def generate_ai_talent_data(self, date_obj):
        """
        Product 2: AI Talent & Capital Prediction
        Columns: company, date, github_stars_7d, arxiv_papers, citations, patents_filed, 
                 investor_engagement, funding_probability, technical_momentum, talent_score, premium_insight,
                 innovation_delay_days, benchmark_inflation_pct, flight_status
        """
        companies = ["OpenAI", "Anthropic", "StabilityAI", "Cohere", "Hugging Face"]
        
        data = []
        for co in companies:
            github_stars = f"+{int(np.random.exponential(200))}"
            arxiv = np.random.poisson(2)
            citations = int(np.random.exponential(50))
            patents = np.random.poisson(0.5)
            investor_engagement = random.choice(["High", "Medium", "Low"])
            
            # Proprietary Metrics
            tech_momentum = min(100, int((arxiv * 10) + (citations * 0.5) + (int(github_stars.replace('+',''))/10)))
            talent_score = random.randint(60, 99)
            funding_prob = f"{min(99, int(tech_momentum * 0.8 + talent_score * 0.1))}%"
            
            # New Profit Metrics
            innovation_delay_days = random.choice([0, 0, 0, 30, 60, 90, 180])
            benchmark_inflation_pct = random.randint(0, 50)
            flight_status = "On Time" if innovation_delay_days == 0 else "Delayed"
            if tech_momentum > 90:
                flight_status = "Accelerating"
            
            if "High" in investor_engagement and tech_momentum > 80:
                insight = "Strong Series D candidate - investor engagement at all-time high"
            elif tech_momentum < 40:
                insight = "Momentum slowing - may seek acquisition vs. next round"
            else:
                insight = "Steady technical output, organic growth phase"

            data.append({
                "company": co,
                "date": date_obj.strftime("%Y-%m-%d"),
                "github_stars_7d": github_stars,
                "arxiv_papers": arxiv,
                "citations": citations,
                "patents_filed": patents,
                "investor_engagement": investor_engagement,
                "funding_probability": funding_prob,
                "technical_momentum": tech_momentum,
                "talent_score": talent_score,
                "premium_insight": insight,
                "innovation_delay_days": innovation_delay_days,
                "benchmark_inflation_pct": benchmark_inflation_pct,
                "flight_status": flight_status
            })
        return data

    # --- 3. ESG IMPACT & GREENWASHING DETECTOR ---
    def generate_esg_data(self, date_obj):
        """
        Product 3: ESG Impact & Greenwashing Detector
        Columns: company, date, esg_claims, verifiable_actions, greenwashing_index, 
                 regulatory_risk, stakeholder_score, impact_verified, premium_insight,
                 claims_psi, reality_psi, greenwashing_gap_pct
        """
        companies = ["Tesla", "ExxonMobil", "Unilever", "BlackRock", "Patagonia"]
        
        data = []
        for co in companies:
            claims = random.randint(10, 50)
            verified = int(claims * random.uniform(0.2, 0.9))
            
            # Proprietary Metrics
            greenwashing_index = int((1 - (verified/claims)) * 100)
            reg_risk = "High" if greenwashing_index > 60 else "Medium" if greenwashing_index > 30 else "Low"
            stakeholder_score = random.randint(40, 95)
            impact_verified = f"{int((verified/claims)*100)}%"
            
            # New Profit Metrics
            claims_psi = 100
            reality_psi = int((verified/claims) * 100)
            greenwashing_gap_pct = claims_psi - reality_psi
            
            if greenwashing_index > 70:
                insight = f"High greenwashing risk - {100-int((verified/claims)*100)}% of claims lack verification"
            elif stakeholder_score > 85:
                insight = "Strong stakeholder alignment driving brand equity"
            else:
                insight = "Strong on operations but weak on supply chain transparency"

            data.append({
                "company": co,
                "date": date_obj.strftime("%Y-%m-%d"),
                "esg_claims": claims,
                "verifiable_actions": verified,
                "greenwashing_index": greenwashing_index,
                "regulatory_risk": reg_risk,
                "stakeholder_score": stakeholder_score,
                "impact_verified": impact_verified,
                "premium_insight": insight,
                "claims_psi": claims_psi,
                "reality_psi": reality_psi,
                "greenwashing_gap_pct": greenwashing_gap_pct
            })
        return data

    # --- 4. REGULATORY COMPLIANCE PREDICTION ---
    def generate_regulatory_data(self, date_obj):
        """
        Product 4: Regulatory Compliance Prediction
        Columns: company, date, enforcement_probability, compliance_gap, fines_estimate, 
                 remediation_cost, whistleblower_risk, regulatory_foresight, premium_insight,
                 enforcement_probability_pct, fine_impact_usd
        """
        companies = ["Meta", "Coinbase", "Amazon", "Pfizer", "Goldman Sachs"]
        
        data = []
        for co in companies:
            enf_prob = random.randint(10, 90)
            gap = "Large" if enf_prob > 70 else "Medium" if enf_prob > 40 else "Small"
            fines = f"${random.randint(10, 5000)}M"
            remediation = f"${random.randint(5, 1000)}M"
            whistleblower = "High" if enf_prob > 60 else "Low"
            foresight = random.randint(20, 90)
            
            # New Profit Metrics
            enforcement_probability_pct = enf_prob
            fine_impact_usd = random.randint(10, 5000) * 1000000
            
            if enf_prob > 75:
                insight = "High risk of antitrust action - compliance gaps significant"
            elif foresight > 80:
                insight = "Proactive compliance strategy mitigating sector risks"
            else:
                insight = "Moderate risk - improving compliance but scrutiny remains"

            data.append({
                "company": co,
                "date": date_obj.strftime("%Y-%m-%d"),
                "enforcement_probability": f"{enf_prob}%",
                "compliance_gap": gap,
                "fines_estimate": fines,
                "remediation_cost": remediation,
                "whistleblower_risk": whistleblower,
                "regulatory_foresight": foresight,
                "premium_insight": insight,
                "enforcement_probability_pct": enforcement_probability_pct,
                "fine_impact_usd": fine_impact_usd
            })
        return data

    # --- 5. SUPPLY CHAIN RESILIENCE ---
    def generate_supply_chain_data(self, date_obj):
        """
        Product 5: Supply Chain Resilience
        Columns: company, date, disruption_risk, recovery_days, single_point_failure, 
                 cost_inflation, resilience_score, premium_insight,
                 disruption_probability, days_to_impact
        """
        companies = ["Apple", "Ford", "Nike", "Toyota", "Samsung"]
        
        data = []
        for co in companies:
            risk = random.randint(10, 80)
            recovery = int(risk * 0.6)
            failure_pt = "High" if risk > 60 else "Medium" if risk > 30 else "Low"
            inflation = f"{round(random.uniform(1.0, 15.0), 1)}%"
            resilience = 100 - risk
            
            # New Profit Metrics
            disruption_probability = risk
            days_to_impact = random.randint(5, 60)
            
            if risk > 60:
                insight = "High battery/chip supply risk - alternative suppliers needed urgently"
            elif resilience > 75:
                insight = "Strong supplier diversification but regional dependency remains"
            else:
                insight = "Stable supply chain with moderate inflationary pressure"

            data.append({
                "company": co,
                "date": date_obj.strftime("%Y-%m-%d"),
                "disruption_risk": risk,
                "recovery_days": recovery,
                "single_point_failure": failure_pt,
                "cost_inflation": inflation,
                "resilience_score": resilience,
                "premium_insight": insight,
                "disruption_probability": disruption_probability,
                "days_to_impact": days_to_impact
            })
        return data

    def run_pipeline(self):
        """Run the full data pipeline (Backfill + Update)."""
        logger.info("Starting Premium Data Engine Pipeline...")
        
        # Define file paths
        files = {
            "fintech": "fintech_growth_digest.csv",
            "ai_talent": "ai_talent_heatmap.csv",
            "esg": "esg_sentiment_tracker.csv",
            "regulatory": "regulatory_risk_index.csv",
            "supply_chain": "supply_chain_risk.csv"
        }
        
        total_added_bytes = 0
        details = {}
        
        for key, generator in self.verticals.items():
            base_filename = files[key].replace('.csv', '')
            
            # 1. Generate or Load Full Dataset
            full_df = pd.DataFrame()
            
            # Check if we have existing data to append to
            # We'll look for the Yearly file as the "master"
            yearly_path = os.path.join(DATA_DIR, f"{base_filename}_2025_yearly.csv")
            
            if not os.path.exists(yearly_path):
                logger.info(f"Backfilling {key} (365 days)...")
                dates = self.generate_date_range(365)
                all_data = []
                for d in dates:
                    all_data.extend(generator(d))
                full_df = pd.DataFrame(all_data)
            else:
                logger.info(f"Updating {key} (Daily)...")
                # Load existing
                full_df = pd.read_csv(yearly_path)
                
                # Generate today's data
                today = datetime.now()
                today_str = today.strftime("%Y-%m-%d")
                
                # Check if today exists
                if today_str not in full_df['date'].values:
                    today_data = generator(today)
                    new_row = pd.DataFrame(today_data)
                    full_df = pd.concat([full_df, new_row], ignore_index=True)
            
            # 2. Save Split Files
            # Ensure 'date' is datetime
            full_df['date'] = pd.to_datetime(full_df['date'])
            
            # Save Yearly (2025)
            df_2025 = full_df[full_df['date'].dt.year == 2025]
            if not df_2025.empty:
                df_2025.to_csv(yearly_path, index=False)
                details[f"{base_filename}_2025_yearly.csv"] = os.path.getsize(yearly_path)
            
            # Save Quarterlys
            for q in [1, 2, 3, 4]:
                df_q = df_2025[df_2025['date'].dt.quarter == q]
                if not df_q.empty:
                    q_path = os.path.join(DATA_DIR, f"{base_filename}_2025_q{q}.csv")
                    df_q.to_csv(q_path, index=False)
                    details[f"{base_filename}_2025_q{q}.csv"] = os.path.getsize(q_path)

            # Save "Latest" for Preview API (Legacy support)
            # We'll just overwrite the original filename so API doesn't break immediately
            legacy_path = os.path.join(DATA_DIR, files[key])
            full_df.to_csv(legacy_path, index=False)

        return self.finalize_status()

    def finalize_status(self):
        # Calculate total size of data folder
        total_size = sum(os.path.getsize(os.path.join(DATA_DIR, f)) for f in os.listdir(DATA_DIR) if f.endswith('.csv'))
        
        # Save Status
        import json
        status = {
            "last_update": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "total_data_size_bytes": total_size,
            "status": "Premium Data Pipeline Active"
        }
        with open(os.path.join(DATA_DIR, "status.json"), "w") as f:
            json.dump(status, f)
        return status

def update_dataset():
    engine = PremiumDataEngine()
    
    # Measure sizes before
    before_sizes = {}
    for f in os.listdir(DATA_DIR):
        if f.endswith(".csv"):
            before_sizes[f] = os.path.getsize(os.path.join(DATA_DIR, f))
            
    engine.run_pipeline()
    
    # Measure sizes after
    total_added = 0
    details = {}
    for f in os.listdir(DATA_DIR):
        if f.endswith(".csv"):
            new = os.path.getsize(os.path.join(DATA_DIR, f))
            old = before_sizes.get(f, 0)
            diff = new - old
            if diff > 0:
                total_added += diff
                details[f] = diff
                
    # Update status with delta
    import json
    status_path = os.path.join(DATA_DIR, "status.json")
    if os.path.exists(status_path):
        with open(status_path, 'r') as f:
            st = json.load(f)
        st['total_added_bytes'] = total_added
        st['details'] = details
        with open(status_path, 'w') as f:
            json.dump(st, f)
            
    return total_added

if __name__ == "__main__":
    update_dataset()
