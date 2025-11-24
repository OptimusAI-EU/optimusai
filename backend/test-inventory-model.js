const config = require('./config/config');
const { connectDB, sequelize } = require('./config/database');
const models = require('./models');

(async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    
    console.log('\nAvailable models:');
    console.log(Object.keys(models));
    
    console.log('\n✅ Inventory model:', models.Inventory ? 'FOUND' : 'NOT FOUND');
    
    if (models.Inventory) {
      console.log('\nTesting Inventory.findAll()...');
      const items = await models.Inventory.findAll({ limit: 5 });
      console.log(`✅ Found ${items.length} items`);
      console.log('Sample item:', items[0] ? items[0].toJSON() : 'None');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
