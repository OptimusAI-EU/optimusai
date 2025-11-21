const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const config = require('./config/config');
const { connectDB, sequelize } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import models
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Order = require('./models/Order');
const ContactForm = require('./models/ContactForm');
const Product = require('./models/Product');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const contactRoutes = require('./routes/contact');
const subscriptionRoutes = require('./routes/subscription');
const orderRoutes = require('./routes/order');

// Initialize app
const app = express();

// Connect to database and sync models
(async () => {
  try {
    await connectDB();
    
    // Initialize all models
    const UserModel = User(sequelize);
    const SubscriptionModel = Subscription(sequelize);
    const OrderModel = Order(sequelize);
    const ContactFormModel = ContactForm(sequelize);
    const ProductModel = Product(sequelize);
    
    // Setup associations
    UserModel.hasMany(SubscriptionModel, { foreignKey: 'userId' });
    SubscriptionModel.belongsTo(UserModel, { foreignKey: 'userId' });
    
    UserModel.hasMany(OrderModel, { foreignKey: 'userId' });
    OrderModel.belongsTo(UserModel, { foreignKey: 'userId' });
    
    UserModel.hasMany(ContactFormModel, { foreignKey: 'userId' });
    ContactFormModel.belongsTo(UserModel, { foreignKey: 'userId' });
    
    // Sync database
    await sequelize.sync({ alter: false });
    console.log('Database models synced successfully.');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
})();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Session configuration
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport strategies
require('./config/passport');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.env} mode`);
});

module.exports = app;
