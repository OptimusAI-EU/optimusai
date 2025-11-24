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
      // VPN Detection Fields
      isVPNDetected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      vpnProvider: {
        type: DataTypes.STRING,
        allowNull: true,
        // 'ExpressVPN', 'NordVPN', 'ProtonVPN', etc.
      },
      vpnDetectionScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // 0-100 fraud score
      },
      vpnLocation: {
        type: DataTypes.JSON,
        allowNull: true,
        // { country, city, latitude, longitude, isp } - location from VPN IP
      },
      // Real Location (when VPN is disabled)
      realLocation: {
        type: DataTypes.JSON,
        allowNull: true,
        // { country, city, latitude, longitude, isp, confirmed: true }
      },
      realIPConfirmedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Detection History
      vpnDetectionHistory: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        // [{ timestamp, ip, isVPN, provider, method }]
      },
      // WebRTC/DNS Leak Info
      webRTCLeakDetected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      leakedIPs: {
        type: DataTypes.JSON,
        allowNull: true,
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
