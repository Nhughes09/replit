import pandas as pd
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DataProductManager:
    def __init__(self, base_path="data"):
        self.base_path = base_path
        # Create directory structure
        self.dirs = {
            'monthly': os.path.join(base_path, 'monthly'),
            'quarterly': os.path.join(base_path, 'quarterly'),
            'yearly': os.path.join(base_path, 'yearly'),
            'bundles': os.path.join(base_path, 'bundles')
        }
        for dir_path in self.dirs.values():
            os.makedirs(dir_path, exist_ok=True)
    
    def calculate_price(self, file_type, row_count):
        """Calculate optimal pricing based on data volume"""
        pricing_model = {
            'monthly': {'base': 99, 'per_10k': 5, 'cap': 299},
            'quarterly': {'base': 249, 'per_10k': 10, 'cap': 699},
            'yearly': {'base': 899, 'per_10k': 20, 'cap': 1999},
            'bundle': {'base': 2999, 'per_10k': 50, 'cap': 4999}
        }
        
        model = pricing_model.get(file_type, pricing_model['monthly'])
        price = model['base'] + ((row_count // 10000) * model['per_10k'])
        return min(price, model['cap'])
    
    def smart_split_csv(self, master_file, product_type):
        """
        Intelligently split master CSV into marketable products
        """
        if not os.path.exists(master_file):
            logger.warning(f"Master file not found: {master_file}")
            return {}

        try:
            df = pd.read_csv(master_file)
            
            # Normalize date column
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'])
            elif 'scraped_date' in df.columns:
                df['date'] = pd.to_datetime(df['scraped_date'])
            else:
                # Fallback if no date column
                logger.warning(f"No date column found in {master_file}")
                return {}
            
            created_files = {}
            
            # 1. Create Bundle (Master File)
            bundle_path = os.path.join(self.dirs['bundles'], f'{product_type}_FULL.csv')
            df.to_csv(bundle_path, index=False)
            created_files[bundle_path] = {
                'type': 'bundle',
                'period': 'All Time',
                'rows': len(df),
                'size_mb': os.path.getsize(bundle_path) / (1024*1024),
                'price': self.calculate_price('bundle', len(df)),
                'description': f'Complete Historical Bundle'
            }
            
            # 2. Split by Year
            for year, year_data in df.groupby(df['date'].dt.year):
                yearly_path = os.path.join(self.dirs['yearly'], f'{product_type}_{year}.csv')
                year_data.to_csv(yearly_path, index=False)
                
                created_files[yearly_path] = {
                    'type': 'yearly',
                    'period': str(year),
                    'rows': len(year_data),
                    'size_mb': os.path.getsize(yearly_path) / (1024*1024),
                    'price': self.calculate_price('yearly', len(year_data)),
                    'description': f'{year} Full Year Dataset'
                }
                
                # 3. Split by Quarter
                for quarter in range(1, 5):
                    q_data = year_data[year_data['date'].dt.quarter == quarter]
                    if len(q_data) > 0:
                        q_path = os.path.join(self.dirs['quarterly'], f'{product_type}_{year}_Q{quarter}.csv')
                        q_data.to_csv(q_path, index=False)
                        
                        created_files[q_path] = {
                            'type': 'quarterly',
                            'period': f'{year} Q{quarter}',
                            'rows': len(q_data),
                            'size_mb': os.path.getsize(q_path) / (1024*1024),
                            'price': self.calculate_price('quarterly', len(q_data)),
                            'description': f'{year} Q{quarter} Dataset'
                        }
                        
                        # 4. Split by Month (only if we have quarterly data)
                        # Optimization: Only do this if requested, but for now we do it.
                        # Actually, let's stick to Q/Y/Bundle to avoid file explosion for this demo
                        # unless the user explicitly wants monthly. The prompt said "Tier 3: Monthly".
                        # Okay, let's do monthly.
                        for month in range((quarter-1)*3 + 1, quarter*3 + 1):
                            m_data = q_data[q_data['date'].dt.month == month]
                            if len(m_data) > 0:
                                m_path = os.path.join(self.dirs['monthly'], f'{product_type}_{year}_{month:02d}.csv')
                                m_data.to_csv(m_path, index=False)
                                created_files[m_path] = {
                                    'type': 'monthly',
                                    'period': f'{year}-{month:02d}',
                                    'rows': len(m_data),
                                    'size_mb': os.path.getsize(m_path) / (1024*1024),
                                    'price': self.calculate_price('monthly', len(m_data)),
                                    'description': f'{year}-{month:02d} Dataset'
                                }

            return created_files
            
        except Exception as e:
            logger.error(f"Error processing {master_file}: {e}")
            return {}

    def generate_catalog(self, all_products):
        """Generate a list of products for the UI."""
        catalog = []
        for filepath, info in all_products.items():
            catalog.append({
                'filename': os.path.basename(filepath),
                'path': filepath, # Internal use
                'type': info['type'],
                'period': info['period'],
                'rows': info['rows'],
                'size_mb': f"{info['size_mb']:.2f}",
                'price': info['price'],
                'description': info['description'],
                'download_url': f"/download/{os.path.basename(filepath)}"
            })
        # Sort by type (Bundle -> Yearly -> Quarterly -> Monthly)
        order = {'bundle': 0, 'yearly': 1, 'quarterly': 2, 'monthly': 3}
        catalog.sort(key=lambda x: (order.get(x['type'], 99), x['period']))
        return catalog
