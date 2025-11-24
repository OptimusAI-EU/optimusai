const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Inventory extends Model {}

  Inventory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM('Robot', 'Software', 'Service'),
        allowNull: false,
      },
      productNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      location: {
        type: DataTypes.JSON,
        allowNull: true,
        // { latitude, longitude, address }
      },
      status: {
        type: DataTypes.ENUM('In Store', 'Sold', 'Hired'),
        defaultValue: 'In Store',
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      specifications: {
        type: DataTypes.JSON,
        allowNull: true,
        // Can store any additional specs
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
    },
    {
      sequelize,
      modelName: 'Inventory',
      tableName: 'Inventories',
      timestamps: true,
    }
  );

  return Inventory;
};
