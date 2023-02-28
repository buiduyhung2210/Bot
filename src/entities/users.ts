
import { DataTypes } from 'sequelize';

const UserEntity = {
  id: {
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false,
  },
  teleId: {
    type: DataTypes.STRING(255), allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING(255), allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING(255), allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255), allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATE, allowNull: true,
  },
  role: {
    type: DataTypes.ENUM({ values: ['admin', 'user'] }),
    allowNull: true,
  },
  accountNumber: {
    type: DataTypes.NUMBER, allowNull: false,
  },
  accountBalance: {
    type: DataTypes.NUMBER, allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
};

export default UserEntity;
