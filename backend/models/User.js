const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }

    getPublicProfile() {
      const userObject = this.toJSON();
      delete userObject.password;
      if (userObject.oauth) {
        delete userObject.oauth.googleProfile;
        delete userObject.oauth.githubProfile;
      }
      return userObject;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        lowercase: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileImage: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      company: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin', 'moderator'),
        defaultValue: 'user',
      },
      subscriptionStatus: {
        type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'paused'),
        defaultValue: 'inactive',
      },
      subscriptionStartDate: {
        type: DataTypes.DATE,
      },
      subscriptionEndDate: {
        type: DataTypes.DATE,
      },
      billingAddress: {
        type: DataTypes.JSON,
      },
      shippingAddress: {
        type: DataTypes.JSON,
      },
      oauth: {
        type: DataTypes.JSON,
      },
      googleId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      googleProfile: {
        type: DataTypes.TEXT,
      },
      githubId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      githubProfile: {
        type: DataTypes.TEXT,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailVerificationToken: {
        type: DataTypes.STRING,
      },
      emailVerificationExpires: {
        type: DataTypes.DATE,
      },
      passwordResetToken: {
        type: DataTypes.STRING,
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
      },
      loginHistory: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
    }
  );

  // Hash password before saving
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  return User;
};
