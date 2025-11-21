const { sequelize } = require('../config/database');
const User = require('./User')(sequelize);
const Subscription = require('./Subscription')(sequelize);
const Order = require('./Order')(sequelize);
const ContactForm = require('./ContactForm')(sequelize);
const Product = require('./Product')(sequelize);

// Setup associations
User.hasMany(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ContactForm, { foreignKey: 'userId' });
ContactForm.belongsTo(User, { foreignKey: 'userId' });

Order.belongsToMany(Product, { through: 'OrderItems' });
Product.belongsToMany(Order, { through: 'OrderItems' });

module.exports = {
  sequelize,
  User,
  Subscription,
  Order,
  ContactForm,
  Product,
};
