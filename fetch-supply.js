const axios = require('axios');
const fs = require('fs');

async function fetchSupply() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/ripple-usd/market_chart?vs_currency=usd&days=30');
        const marketCaps = response.data.market_caps; // [timestamp, market_cap] pairs
        const supplyData = marketCaps.map(([timestamp, marketCap]) => {
            const date = new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
            const supply = marketCap / 1; // RLUSD is pegged to 1 USD, so market cap ≈ supply
            return { date, supply };
        });

        // Ensure unique dates (CoinGecko might return multiple points per day)
        const uniqueData = [];
        const seenDates = new Set();
        for (const entry of supplyData) {
            if (!seenDates.has(entry.date)) {
                seenDates.add(entry.date);
                uniqueData.push(entry);
            }
        }

        // Limit to 30 days
        const finalData = uniqueData.slice(-30);
        fs.writeFileSync('data.json', JSON.stringify(finalData, null, 2));
    } catch (error) {
        console.error('Error fetching supply:', error);
    }
}

fetchSupply();