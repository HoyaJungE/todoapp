const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// Set up file upload directory
const uploadDirectory = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure upload directory exists
const fs = require('fs');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const authRoutes = require('./routes/authRoutes');
const goodsRoutes = require('./routes/goodsRoutes');
const menuRoutes = require('./routes/menuRoutes');
const fileRoutes = require('./routes/fileRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/files', fileRoutes);

// Serve static files from the upload directory
app.use('/uploads', express.static(uploadDirectory));

app.listen(port, async () => {
    try {
        await db.initialize();
        console.log('Connected to Oracle database');
        console.log(`Server running on port ${port}`);
    } catch (err) {
        console.error('Failed to connect to Oracle database', err);
    }
});
