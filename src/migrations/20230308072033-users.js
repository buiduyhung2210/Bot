'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teleId: {
        type: Sequelize.STRING(255)
      },
      fullName: {
        type: Sequelize.STRING(255)
      },
      phoneNumber: {
        type: Sequelize.STRING(255)
      },
      password: {
        type: Sequelize.STRING(255)
      },
      dateOfBirth: {
        type: Sequelize.DATE, allowNull: true,
      },
      role: {
        type: Sequelize.ENUM({ values: ['admin', 'user'] }),
        allowNull: true,
      },
      accountNumber: {
        type: Sequelize.INTEGER
      },
      accountBalance: {
        type: Sequelize.INTEGER, defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    }, {
      charset: 'utf8mb4',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
