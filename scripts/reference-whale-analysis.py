I am building a project titled ‘blockchain risk & transparency dashboard’. The project’s breakdown is as follows:
1. Classify Whale Transfers by Direction (Most Critical)
Inflows to exchanges = likely sell pressure → bearish signal.
Outflows from exchanges = likely accumulation → bullish signal.
Stablecoin inflows/outflows = show whether whales are rotating to “risk-off” (USDT/USDC) or “risk-on” (ETH/BTC).
This adds interpretability instead of just “whales are moving money.”


2. Whale vs. Market Context
Overlay whale activity with ETH volatility or market sentiment (fear & greed index / BTC dominance).
Example: do whales move big right before volatility spikes?
This links whale behavior to market dynamics.

3. Concentration & Transparency Metrics
Compute Herfindahl-Hirschman Index (HHI) or Gini coefficient of whale transfers.
High concentration = few whales dominate (risky, less transparent).
Low concentration = activity more spread out (healthier).
This directly speaks to risk and transparency, the angle you wanted.

4. Predictive Signals (Research-Grade)
Rolling correlation: does whale activity lead ETH price?
Event study: look at ETH returns 1–7 days after large whale inflows/outflows.
This tests whether whales are price movers or just followers.

5. Optional (Advanced Layer if Time Allows)
Clustering whales by behavior (dumpers vs. hodlers).
Anomaly detection: highlight unusual whale days (spikes 3σ above normal).
Simple ML model to test predictive power (whale inflows → ETH price drop).

Suggested Dashboard Tabs
1. Market Overview → ETH price, volume, whale transfers overlay.
2. Whale Inflows vs. Outflows → Exchange vs. non-exchange wallets, risk signals.
3. Stablecoin Rotation → Whale moves ETH ↔ USDT/USDC.
4. Whale Concentration & Risk → HHI, Gini, whale-to-retail ratio.
5. Predictive Signals → Rolling correlations, event studies, anomalies.


I have written some queries in dune for whale transaction and exchange wallets. The codes below call them using their respective query ids and call live price data by using their APIs. fastAPI will be needed. You can pick ideas from the different codes provided and come up with the best that fit the project. Choose the best of endpoint for the price data or get a better one.

# Inflow vs outflow classification
import requests
import pandas as pd
from datetime import datetime, time, timezone
from dotenv import load_dotenv
import os
import time

# Load Dune API Key and Coingecko API Key
load_dotenv()
API_KEY = os.getenv("DUNE_KEY")
COINGECKO_API_KEY = os.getenv("GECKO_KEY")
# 1. Dune API credentials and query
QUERY_ID = 5781730  # Replace with your actual query ID

headers = {
    "x-dune-api-key": API_KEY
}

# 2. Run the query
run_query_url = f"https://api.dune.com/api/v1/query/{QUERY_ID}/execute"
response = requests.post(run_query_url, headers=headers)
run_data = response.json()
execution_id = run_data['execution_id']

# 3. Poll until the query is finished
status = ''
while status not in ['QUERY_STATE_COMPLETED', 'QUERY_STATE_FAILED']:
    time.sleep(2)
    status_response = requests.get(f"https://api.dune.com/api/v1/execution/{execution_id}/status", headers=headers)
    status_data = status_response.json()
    status = status_data.get('state', '')

# 4. Fetch results
results_url = f"https://api.dune.com/api/v1/execution/{execution_id}/results"
results_response = requests.get(results_url, headers=headers)
results_json = results_response.json()

# 5. Convert to DataFrame
df = pd.DataFrame(results_json['result']['rows'])

# 6. Clean and classify inflow/outflow
df['inflow'] = df['inflow'].astype(float)
df['outflow'] = df['outflow'].astype(float)
df['week_start'] = pd.to_datetime(df['week_start'])

# 7. Example: Aggregate by exchange and token
summary = df.groupby(['exchange', 'contract_address', 'week_start'])[['inflow', 'outflow']].sum().reset_index()
#print(summary.head())
# Set the directory and filename for the CSV
csv_folder = r'd:\My folder\Blockchain_Risk_&_Transparency_Dashboard\data'
os.makedirs(csv_folder, exist_ok=True)  # Create the folder if it doesn't exist
csv_path = os.path.join(csv_folder, 'data_summary.csv')

# Save summary to CSV in the correct directory
summary.to_csv(csv_path, index=False)

# 8. Optional: Visualize inflow vs outflow
import matplotlib.pyplot as plt
for exchange in summary['exchange'].unique():
    ex_data = summary[summary['exchange'] == exchange]
    plt.figure(figsize=(10,5))
    plt.plot(ex_data['week_start'], ex_data['inflow'], label='Inflow')
    plt.plot(ex_data['week_start'], ex_data['outflow'], label='Outflow')
    plt.title(f"{exchange} Inflow vs Outflow")
    plt.xlabel("Week Start")
    plt.ylabel("Amount")
    plt.legend()
    plt.show()
the above code gave really funny plots.

# Whale vs price overlay plots
import matplotlib.pyplot as plt

def plot_whale_overlays(merged_df):
    """
    Generates whale vs price overlay plots for all unique tokens in merged_df.
    """
    unique_tokens = merged_df["token"].dropna().unique()

    for token_name in unique_tokens:
        token_data = merged_df[merged_df["token"] == token_name]

        if token_data.empty:
            continue  # skip tokens with no data

        fig, ax1 = plt.subplots(figsize=(12, 6))

        # Plot price as a line
        ax1.plot(token_data["timestamp"], token_data["price_usd"], 
                 color="blue", label=f"{token_name} Price (USD)")
        ax1.set_ylabel("Price (USD)", color="blue")

        # Plot whale transfers as scatter
        ax2 = ax1.twinx()
        ax2.scatter(token_data["timestamp"], token_data["amount"], 
                    color="red", alpha=0.6, label="Whale Transfers")
        ax2.set_ylabel("Whale Transfer Amount", color="red")

        # Titles & legends
        fig.suptitle(f"Whale Transfers vs {token_name.capitalize()} Price")
        ax1.legend(loc="upper left")
        ax2.legend(loc="upper right")

        plt.show()

# Example usage:
plot_whale_overlays(merged)

# Example: filter for ETH
eth_data = merged[merged["token"] == "ethereum"]

# Plot overlay
fig, ax1 = plt.subplots(figsize=(12,6))

# Price (line)
ax1.plot(eth_data["timestamp"], eth_data["price_usd"], color="blue", label="ETH Price (USD)")
ax1.set_ylabel("Price (USD)", color="blue")

# Whale amount (scatter on secondary y-axis)
ax2 = ax1.twinx()
ax2.scatter(eth_data["timestamp"], eth_data["amount"], color="red", alpha=0.6, label="Whale Transfers")
ax2.set_ylabel("Whale Transfer Amount", color="red")

# Titles & legends
fig.suptitle("Ethereum Whale Transfers vs Price")
ax1.legend(loc="upper left")
ax2.legend(loc="upper right")
plt.show()
this above plots also gave really funny plots 


then this code below was use to get the full code as using live data as it is supposed to be used for the project.
import os
import time
import sqlite3
import requests
import pandas as pd
import matplotlib.pyplot as plt
from dotenv import load_dotenv
from dune_client.client import DuneClient

# ==============================
# 1. Load ENV
# ==============================
dotenv_path = r'd:\My folder\Blockchain_Risk_&_Transparency_Dashboard\.env'
load_dotenv(dotenv_path)

DUNE_API_KEY = os.getenv("DUNE_KEY")
COINGECKO_BASE = "https://api.coingecko.com/api/v3"
DB_PATH = r'd:\My folder\Blockchain_Risk_&_Transparency_Dashboard\data\blockchain.db'

# ==============================
# 2. Dune Queries Setup
# ==============================
WHALE_QUERY_ID = 5763322     # Whale transfers
INFLOW_QUERY_ID = 5781730    # Exchange inflow/outflow

dune_client = DuneClient(DUNE_API_KEY)

def fetch_dune_query_results(query_id):
    """Fetch latest dune query results into dataframe"""
    result = dune_client.get_latest_result(query_id)
    df = pd.DataFrame(result.result.rows)
    return df

# ==============================
# 3. Fetch Whale Data
# ==============================
whales_df = fetch_dune_query_results(WHALE_QUERY_ID)
print("Whale transfers:")
print(whales_df.head())

# ==============================
# 4. Fetch Inflow/Outflow Data
# ==============================
def fetch_inflow_outflow(query_id):
    headers = {"x-dune-api-key": DUNE_API_KEY}
    run_query_url = f"https://api.dune.com/api/v1/query/{query_id}/execute"
    response = requests.post(run_query_url, headers=headers)
    run_data = response.json()
    execution_id = run_data['execution_id']

    # Poll for completion
    status = ''
    while status not in ['QUERY_STATE_COMPLETED', 'QUERY_STATE_FAILED']:
        print("Waiting for inflow/outflow query to finish...")
        time.sleep(3)
        status_response = requests.get(
            f"https://api.dune.com/api/v1/execution/{execution_id}/status",
            headers=headers
        )
        status_data = status_response.json()
        status = status_data.get('state', '')

    results_url = f"https://api.dune.com/api/v1/execution/{execution_id}/results"
    results_response = requests.get(results_url, headers=headers)
    results_json = results_response.json()
    df = pd.DataFrame(results_json['result']['rows'])

    # Type casting
    df['inflow'] = df['inflow'].astype(float)
    df['outflow'] = df['outflow'].astype(float)
    df['week_start'] = pd.to_datetime(df['week_start']).dt.tz_localize(None)
    return df

summary = fetch_inflow_outflow(INFLOW_QUERY_ID)
print("Inflow/Outflow:")
print(summary.head())

# ==============================
# 5. Fetch Live Prices (CoinGecko)
# ==============================
assets = ["ethereum", "bitcoin", "tether", "usd-coin"]

def fetch_live_prices(assets):
    url = f"{COINGECKO_BASE}/simple/price"
    response = requests.get(url, params={"ids": ",".join(assets), "vs_currencies": "usd"})
    return response.json()

prices_json = fetch_live_prices(assets)

# Convert to dataframe
prices_records = []
timestamp = pd.Timestamp.utcnow()
for asset, data in prices_json.items():
    prices_records.append({
        "asset": asset,
        "price_usd": data["usd"],
        "timestamp": timestamp
    })

prices_df = pd.DataFrame(prices_records)
prices_df['week_start'] = prices_df['timestamp'].dt.to_period('W').apply(lambda r: r.start_time)

# Save to DB (append)
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
conn = sqlite3.connect(DB_PATH)
prices_df.to_sql("prices", conn, if_exists="append", index=False)
conn.close()

# ==============================
# 6. Mapping Contracts to Tokens
# ==============================
asset_to_token = {
    'usd-coin': 'USDC',
    'tether': 'USDT',
    'ethereum': 'WETH',
    'bitcoin': 'WBTC',
}
prices_df['token'] = prices_df['asset'].map(asset_to_token)

contract_to_token = {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC'
}
summary['contract_address'] = summary['contract_address'].str.lower()
summary['token'] = summary['contract_address'].map(contract_to_token)

# ==============================
# 7. Merge Price + Inflow/Outflow
# ==============================
merged_summary = pd.merge(
    summary,
    prices_df[['token', 'week_start', 'price_usd']],
    how='left',
    on=['token', 'week_start']
)

print("\nMerged inflow/outflow with prices:")
print(merged_summary.head())

# ==============================
# 8. Visualization
# ==============================
for token in merged_summary['token'].dropna().unique():
    token_df = merged_summary[merged_summary['token'] == token]
    if token_df['inflow'].sum() == 0 and token_df['outflow'].sum() == 0:
        print(f"No inflow/outflow data for {token}")
        continue

    plt.figure(figsize=(12,6))
    plt.plot(token_df['week_start'], token_df['price_usd'], label='Price (USD)', color="blue")
    plt.bar(token_df['week_start'], token_df['inflow'], alpha=0.5, label='Inflow', color="green")
    plt.bar(token_df['week_start'], -token_df['outflow'], alpha=0.5, label='Outflow', color="red")
    plt.title(f"{token} Inflow/Outflow vs Price")
    plt.legend()
    plt.show()

I want you to help me in building this dashboard by making it very insightful and meaningful. Work on both the frontend and backend. You can drop some unnecessary metrics and include what best suit this project. Use css and html. Design it with the perfect dropdowns and theme toggle. Give each section and toggle the best of matching colors. Use the best and most suitable visualization and charts in each part. Also give each section an ‘about section’ possibly as dropdowns. React.js and next.js may be used. You can give adjustments and twerks to the code and information provided above if necessary. Ask for more details incase you arent clear in proceeding with the building of the project or the dune query I have written for possibly adjustment too. I used 7days in my dune queries and extended days for price data so it can capture and fit the 7days for whale and exchange wallets. You can adjust that too for what is most proper and seek for me to also effect it on the dune queries. Below are the dune queries you can use it to get insight or/and suggest or rewrite better dune queries to use for the project. 

Exchange_wallet dune query
WITH exchange_wallets AS (
    SELECT 0x742d35Cc6634C0532925a3b844Bc454e4438f44e AS wallet_address, 'Bitfinex' AS exchange
    UNION ALL
    SELECT 0x56eddb7aa87536c09ccc2793473599fd21a8b17f, 'Binance'
    UNION ALL
    SELECT 0x4e83362442b8d1bec281594cea3050c8eb01311c, 'Coinbase'
),
transfers AS (
    SELECT
        date_trunc('week', evt_block_time) AS week_start,
        "from" AS from_address,
        "to" AS to_address,
        value / 1e18 AS amount,
        contract_address
    FROM erc20_ethereum.evt_transfer
    WHERE contract_address IN (
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
        0xdAC17F958D2ee523a2206206994597C13D831ec7,
        0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2,
        0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
    )
    AND evt_block_time >= now() - interval '6' month
)
SELECT
    e.exchange,
    t.week_start,
    SUM(CASE WHEN t.to_address = e.wallet_address THEN t.amount ELSE 0 END) AS inflow,
    SUM(CASE WHEN t.from_address = e.wallet_address THEN t.amount ELSE 0 END) AS outflow,
    t.contract_address
FROM transfers t
INNER JOIN exchange_wallets e
    ON t.to_address = e.wallet_address OR t.from_address = e.wallet_address
GROUP BY e.exchange, t.week_start, t.contract_address
ORDER BY t.week_start, e.exchange, t.contract_address;



Combined_whales dune query
-- ETH Whale Transfers
SELECT
  block_time AS timestamp,
  hash AS tx_hash,
  "from" AS from_address,
  "to" AS to_address,
  value / 1e18 AS amount,
  'ETH' AS token
FROM ethereum.transactions
WHERE block_time >= NOW() - interval '7' day
  AND value / 1e18 >= 1000   -- 1000 ETH+
  
UNION ALL

-- USDT Whale Transfers
SELECT
  evt_block_time AS timestamp,
  evt_tx_hash,
  "from" AS from_address,
  "to" AS to_address,
  value / 1e6 AS amount,      -- USDT has 6 decimals
  'USDT' AS token
FROM erc20_Ethereum.evt_Transfer"ERC20_evt_Transfer"
WHERE contract_address = 0xdac17f958d2ee523a2206206994597c13d831ec7 -- USDT contract
  AND evt_block_time >= NOW() - interval '7' day
  AND value / 1e6 >= 1000000  -- 1M USDT+

UNION ALL

-- USDC Whale Transfers
SELECT
  evt_block_time AS timestamp,
  evt_tx_hash,
  "from" AS from_address,
  "to" AS to_address,
  value / 1e6 AS amount,      -- USDC has 6 decimals
  'USDC' AS token
FROM erc20_Ethereum.evt_Transfer"ERC20_evt_Transfer"
WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 -- USDC contract
  AND evt_block_time >= NOW() - interval '7' day
  AND value / 1e6 >= 1000000  -- 1M USDC+

ORDER BY timestamp DESC
LIMIT 3000;


Start building now!
