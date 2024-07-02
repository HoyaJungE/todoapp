const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');
const goodsRoutes = require('./routes/goodsRoutes');
const menuRoutes = require('./routes/menuRoutes');
const fileRoutes = require('./routes/fileRoutes');
const roleRoutes = require('./routes/roleRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/role', roleRoutes);

app.listen(port, async () => {
    try {
        await db.initialize();
        console.log('Connected to Oracle database');
        console.log(`Server running on port ${port}`);
    } catch (err) {
        console.error('Failed to connect to Oracle database', err);
    }
});
