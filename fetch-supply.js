const axios = require('axios');
const fs = require('fs');

async function fetchSupply() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/ripple-usd');
        const supply = Math.round(response.data.market_data.circulating_supply); // Integer supply
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Load existing data or initialize
        let data = [];
        if (fs.existsSync('data.json')) {
            data = JSON.parse(fs.readFileSync('data.json'));
        }

        // Remove any existing entry for today (to avoid duplicates)
        data = data.filter(entry => entry.date !== date);

        // Add today’s supply
        data.push({ date, supply });

        // Limit to 365 days
        if (data.length > 365) data.shift();

        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error fetching supply:', error);
    }
}

fetchSupply();
