const { sequelize, connectDB } = require('./config/database');
const bcrypt = require('bcryptjs');

const seedAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('✓ Database connected');

    // Get User model
    const { User } = require('./models');

    // Check if admin already exists
    const adminExists = await User.findOne({
      where: { email: 'optimusrobots@proton.me' }
    });

    if (adminExists) {
      console.log('✓ Admin user already exists: optimusrobots@proton.me');
      console.log('✓ Password: Test1234!');
      // Update password to ensure it's correct
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test1234!', salt);
      await adminExists.update({ password: hashedPassword });
      console.log('✓ Password updated');
      await sequelize.close();
      process.exit(0);
    }

    // Create admin user (beforeCreate hook will hash password)
    const admin = await User.create({
      email: 'optimusrobots@proton.me',
      password: 'Test1234!',
      firstName: 'Optimus',
      lastName: 'Admin',
      role: 'admin',
      isEmailVerified: true,
    });

    console.log('✓ Admin user created successfully!');
    console.log('✓ Email: optimusrobots@proton.me');
    console.log('✓ Password: Test1234!');
    console.log('✓ Role: admin');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding admin user:', error.message);
    console.error(error);
    try {
      await sequelize.close();
    } catch (e) {}
    process.exit(1);
  }
};

seedAdminUser();
