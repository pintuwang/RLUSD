const axios = require('axios');
const fs    = require('fs');

// API key is injected by GitHub Actions via the COINGECKO_API_KEY secret.
// Never hardcode a key here — leave this line exactly as-is.
const API_KEY  = process.env.COINGECKO_API_KEY || '';
const BASE_URL = API_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3';
const HEADERS  = API_KEY ? { 'x-cg-pro-api-key': API_KEY } : {};

async function fetchSupply() {
    try {
        const tier = API_KEY ? 'Pro' : 'Free (public)';
        console.log(`CoinGecko tier: ${tier}`);

        const response = await axios.get(`${BASE_URL}/coins/ripple-usd`, { headers: HEADERS });
        const supply   = Math.round(response.data.market_data.circulating_supply);
        const date     = new Date().toISOString().split('T')[0];

        let data = [];
        if (fs.existsSync('data.json')) {
            data = JSON.parse(fs.readFileSync('data.json'));
        }

        data = data.filter(entry => entry.date !== date);
        data.push({ date, supply });

        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        console.log(`✓ RLUSD supply ${supply.toLocaleString()} saved for ${date}`);
    } catch (error) {
        console.error('Error fetching supply:', error.message);
        process.exit(1);
    }
}

fetchSupply();
