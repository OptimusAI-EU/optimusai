const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class UserSession extends Model {}

  UserSession.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      sessionToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.JSON,
        allowNull: true,
        // Contains: { country, city, latitude, longitude, isp }
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      loginTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      logoutTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'UserSession',
      timestamps: true,
    }
  );

  return UserSession;
};
