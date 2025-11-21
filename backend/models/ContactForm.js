const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class ContactForm extends Model {}

  ContactForm.init(
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM('general', 'support', 'sales', 'partnership'),
        defaultValue: 'general',
      },
      status: {
        type: DataTypes.ENUM('new', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'new',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      attachments: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      responses: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
    },
    {
      sequelize,
      modelName: 'ContactForm',
      timestamps: true,
    }
  );

  return ContactForm;
};
