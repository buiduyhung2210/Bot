import { QueryInterface, DataTypes, QueryTypes, Sequelize } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      return queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false,
        },
        teleId: {
          type: Sequelize.STRING(255), allowNull: true,
        },
        fullName: {
          type: Sequelize.STRING(255), allowNull: false,
        },
        phoneNumber: {
          type: Sequelize.STRING(255), allowNull: false,
        },
        email: {
          type: Sequelize.STRING(255), allowNull: false,
        },
        gender: {
          type: Sequelize.ENUM({ values: ['male', 'female', 'other'] }),
          allowNull: true,
        },
        role: {
          type: Sequelize.ENUM({ values: ['admin', 'user'] }),
          allowNull: true,
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
    }
  ),

  down: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      // here go all migration undo changes
    }
  )
};



