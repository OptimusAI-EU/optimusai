const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {}

  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM('RAAS', 'SAAS', 'education', 'health', 'custom'),
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      images: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      specifications: {
        type: DataTypes.JSON,
      },
      features: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      rating: {
        type: DataTypes.JSON,
        defaultValue: { average: 0, count: 0 },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Product',
      timestamps: true,
    }
  );

  return Product;
};
