const axios = require('axios');
const fs = require('fs');

async function fetchSupply() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/ripple-usd');
        const supply = Math.round(response.data.market_data.circulating_supply); // Integer supply
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Load existing data or start fresh
        let data = [];
        if (fs.existsSync('data.json')) {
            data = JSON.parse(fs.readFileSync('data.json'));
        }

        // Only add if supply increased or it’s a new day with a change
        const lastEntry = data[data.length - 1];
        if (!lastEntry || (lastEntry.date !== date && supply > lastEntry.supply)) {
            data.push({ date, supply });
        }

        // Limit to 30 days
        if (data.length > 30) data.shift();

        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error fetching supply:', error);
    }
}

fetchSupply();
