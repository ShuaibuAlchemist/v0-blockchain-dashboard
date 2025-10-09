// lib/api.ts
// This connects your v0 dashboard to your Render backend

const API_URL = 'https://blockchain-dashboard-api-ujno.onrender.com';

export async function getMarketOverview() {
  const res = await fetch(`${API_URL}/api/market-overview`);
  if (!res.ok) throw new Error('Failed to fetch market overview');
  return res.json();
}

export async function getWhaleTransactions() {
  const res = await fetch(`${API_URL}/api/whale-transactions`);
  if (!res.ok) throw new Error('Failed to fetch whale transactions');
  return res.json();
}

export async function getExchangeFlows() {
  const res = await fetch(`${API_URL}/api/exchange-flows`);
  if (!res.ok) throw new Error('Failed to fetch exchange flows');
  return res.json();
}

export async function getFlowSummary() {
  const res = await fetch(`${API_URL}/api/flow-summary`);
  if (!res.ok) throw new Error('Failed to fetch flow summary');
  return res.json();
}

export async function getPriceHistory(days = 7) {
  const res = await fetch(`${API_URL}/api/price-history?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
}
