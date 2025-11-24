const { sequelize } = require('../config/database');
const User = require('./User')(sequelize);
const Subscription = require('./Subscription')(sequelize);
const Order = require('./Order')(sequelize);
const ContactForm = require('./ContactForm')(sequelize);
const Product = require('./Product')(sequelize);
const UserSession = require('./UserSession')(sequelize);
const UserPreference = require('./UserPreference')(sequelize);
const Inventory = require('./Inventory')(sequelize);

// Setup associations
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ContactForm, { foreignKey: 'userId', as: 'contactForms' });
ContactForm.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(UserPreference, { foreignKey: 'userId', as: 'preferences' });
UserPreference.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Inventory, { foreignKey: 'createdBy', as: 'inventoryItems' });
Inventory.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Note: Order uses JSON field for items, not a separate OrderItems junction table
// so we don't set up belongsToMany relationship with Product

module.exports = {
  sequelize,
  User,
  Subscription,
  Order,
  ContactForm,
  Product,
  UserSession,
  UserPreference,
  Inventory,
};

