const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/api/drug/:name', async (req, res) => {
    const name = req.params.name;
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${name}"&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
});

app.get('/api/recalls', async (req, res) => {
    const url = `https://api.fda.gov/food/enforcement.json?limit=5&sort=report_date:desc`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
});

app.get('/api/events/:name', async (req, res) => {
    const name = req.params.name;
    const url = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${name}"&count=patient.reaction.reactionmeddrapt.exact`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
});

app.get('/api/suggestions/:query', async (req, res) => {
    const query = req.params.query;
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${query}*&limit=5`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});