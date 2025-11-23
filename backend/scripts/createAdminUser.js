const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

const User = require('../models/User')(sequelize);

async function createAdminUser() {
  try {
    const email = 'optimusrobots@proton.me';
    const password = 'Dl00457799$';

    // Check if admin already exists
    let admin = await User.findOne({ where: { email } });
    
    if (admin) {
      // Update existing admin - let the model hash the password
      await admin.update({
        password, // Don't hash here, the beforeUpdate hook will do it
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      });
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create admin user - let the model hash the password
      admin = await User.create({
        email,
        password, // Don't hash here, the beforeCreate hook will do it
        firstName: 'Optimus',
        lastName: 'Admin',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      });
      console.log('✅ Admin user created successfully!');
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nUse these credentials to log in to the admin dashboard.');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
