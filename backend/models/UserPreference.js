const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class UserPreference extends Model {}

  UserPreference.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: 'en',
      },
      theme: {
        type: DataTypes.ENUM('light', 'dark', 'auto'),
        defaultValue: 'auto',
      },
      textSize: {
        type: DataTypes.ENUM('small', 'medium', 'large'),
        defaultValue: 'medium',
      },
      emailNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      pushNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      marketingEmails: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      timezone: {
        type: DataTypes.STRING,
        defaultValue: 'UTC',
      },
    },
    {
      sequelize,
      modelName: 'UserPreference',
      timestamps: true,
    }
  );

  return UserPreference;
};
