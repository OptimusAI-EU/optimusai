const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
  // Disable foreign key constraints to allow table modifications
  dialectOptions: {
    useForeignKeys: false,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connected successfully.');
    
    // Disable foreign key constraints for all schema operations
    await sequelize.query('PRAGMA foreign_keys = OFF');
    
    // Import and initialize models
    const { User, Subscription, Order, ContactForm, Product, UserSession, UserPreference } = require('../models');
    
    // Check if Users table exists
    const tables = await sequelize.getQueryInterface().showAllTables();
    const hasUsersTable = tables.includes('Users');

    if (!hasUsersTable) {
      // First time setup - create fresh tables
      console.log('First time setup - creating tables...');
      
      // Sync all models to create tables
      await sequelize.sync({ force: false, alter: false });
      console.log('Database tables created successfully.');
    } else {
      // Tables exist - attempt safe schema updates
      try {
        await sequelize.sync({ alter: true });
        console.log('Database models synced successfully.');
      } catch (syncError) {
        // If alter fails, try force sync (will drop and recreate)
        console.log('Schema sync had issues, recreating tables...');
        await sequelize.sync({ force: true });
        console.log('Database tables recreated successfully.');
      }
    }
    
    // Re-enable foreign key constraints
    await sequelize.query('PRAGMA foreign_keys = ON');
    
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
