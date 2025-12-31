require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 5000;

// Swagger Config
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Camera Shop API',
            version: '1.0.0',
            description: 'API documentation for the Camera Shop application',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
    },
    // Use forward slashes for glob patterns even on Windows
    apis: [path.join(__dirname, 'routes/*.js').replace(/\\/g, '/')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
console.log('Swagger Docs generated:', swaggerDocs?.info?.title);

// Serve raw JSON for debugging
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rate Limiting
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500, // Limit each IP to 500 requests per 10 mins
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Middleware (Logging)
app.use((req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    next();
});

// Security Headers
app.use(helmet());

// CORS & Parsing
app.use(cors());
app.use(express.json());

// Sanitization (Must be after express.json)
// app.use(mongoSanitize());
// app.use(hpp());

// Rate Limiting
// app.use('/api', limiter);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/camera_shop')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Camera Shop API is running...');
});

app.get('/test', (req, res) => {
    res.send('Test route is working');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
