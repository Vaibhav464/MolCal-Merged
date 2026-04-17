const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// default route -> send index.html
// default route -> send index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/ping', (req, res) => {
    res.json({ ok: true, message: 'MolCal Plus backend is alive' });
});

app.listen(PORT, () => {
    console.log(`Chem MW app running at http://localhost:${PORT}`);
});

