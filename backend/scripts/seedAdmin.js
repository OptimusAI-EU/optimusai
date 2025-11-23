const { User, sequelize } = require('../models');

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({
      where: { email: 'optimusrobots@proton.me' }
    });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user - password will be auto-hashed by beforeCreate hook
    const admin = await User.create({
      email: 'optimusrobots@proton.me',
      password: 'Test1234!',
      firstName: 'Optimus',
      lastName: 'Admin',
      role: 'admin',
      isEmailVerified: true,
    });

    console.log('Admin user created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
