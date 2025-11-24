const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Lazy load models to avoid circular dependencies
let models;
const getModels = () => {
  if (!models) {
    models = require('../models');
  }
  return models;
};

// Get all inventory items with filtering
exports.getAllInventory = async (req, res) => {
  try {
    console.log('📦 Getting all inventory items');
    console.log('📦 User:', req.user);
    const { Inventory, User } = getModels();
    if (!Inventory) {
      console.error('❌ Inventory model is undefined!');
      return res.status(500).json({ error: 'Inventory model not found' });
    }
    const { type, status, search } = req.query;
    let where = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { productName: { [Op.like]: `%${search}%` } },
        { productNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    const items = await Inventory.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    console.log(`✅ Found ${items.length} inventory items`);
    res.json(items);
  } catch (error) {
    console.error('❌ Get inventory error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
  try {
    console.log('📊 Getting inventory statistics');
    const { Inventory } = getModels();
    const totalProducts = await Inventory.count();
    const totalQty = await Inventory.sum('quantity');

    const byType = await Inventory.findAll({
      attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count'], [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQty']],
      group: ['type'],
      raw: true,
    });

    const byStatus = await Inventory.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count'], [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQty']],
      group: ['status'],
      raw: true,
    });

    const recentItems = await Inventory.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'productName', 'quantity', 'status'],
    });

    res.json({
      totalProducts,
      totalQty: totalQty || 0,
      byType,
      byStatus,
      recentItems,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const { Inventory } = getModels();
    const { type, productNumber, productName, quantity, location, status, price, description, specifications } = req.body;
    const userId = req.user?.id;

    if (!type || !productNumber || !productName) {
      return res.status(400).json({ error: 'Missing required fields: type, productNumber, productName' });
    }

    const item = await Inventory.create({
      type,
      productNumber,
      productName,
      quantity: quantity || 0,
      location,
      status: status || 'In Store',
      price,
      description,
      specifications,
      createdBy: userId,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Create inventory error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Product number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { Inventory } = getModels();
    const { id } = req.params;
    const { productNumber, productName, quantity, location, status, price, description, specifications } = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    if (productNumber) item.productNumber = productNumber;
    if (productName) item.productName = productName;
    if (quantity !== undefined) item.quantity = quantity;
    if (location) item.location = location;
    if (status) item.status = status;
    if (price) item.price = price;
    if (description) item.description = description;
    if (specifications) item.specifications = specifications;

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { Inventory } = getModels();
    const { id } = req.params;
    const item = await Inventory.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await item.destroy();
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Increment quantity
exports.incrementQuantity = async (req, res) => {
  try {
    const { Inventory } = getModels();
    const { id } = req.params;
    const { amount = 1 } = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    item.quantity += amount;
    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Increment quantity error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Decrement quantity
exports.decrementQuantity = async (req, res) => {
  try {
    const { Inventory } = getModels();
    const { id } = req.params;
    const { amount = 1 } = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    if (item.quantity < amount) {
      return res.status(400).json({ error: 'Cannot decrement below 0' });
    }

    item.quantity -= amount;
    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Decrement quantity error:', error);
    res.status(500).json({ error: error.message });
  }
};
