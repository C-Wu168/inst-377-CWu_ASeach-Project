const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);



const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile('public/home.html', { root: __dirname });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

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

app.get('/api/searches', async (req, res) => {
    const { data, error } = await supabase
        .from('searches')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(50);

    if (error) return res.status(500).json({ error: error.message });

    const seen = new Set();
    const unique = data.filter(row => {
        const name = row.drug_name.toUpperCase();
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
    }).slice(0, 5);

    res.json(unique);
});

app.post('/api/searches', async (req, res) => {
    const { drug_name } = req.body;

    if (!drug_name) return res.status(400).json({ error: 'drug_name is required' });

    const { data, error } = await supabase
        .from('searches')
        .insert([{ drug_name }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;