const axios = require('axios');
const fs = require('fs');

async function fetchSupply() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/ripple-usd/market_chart?vs_currency=usd&days=30');
        const marketCaps = response.data.market_caps; // [timestamp, market_cap]
        const prices = response.data.prices; // [timestamp, price]

        // Align timestamps and calculate normalized supply
        const supplyData = marketCaps.map(([timestamp, marketCap], index) => {
            const date = new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
            const price = prices[index][1]; // Corresponding price
            const supply = marketCap / price; // Normalize to 1 USD peg
            return { date, supply };
        });

        // Ensure unique dates
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
