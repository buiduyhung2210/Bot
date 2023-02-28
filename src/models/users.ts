import {  Model, Sequelize,} from 'sequelize';


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

interface UserInterface {
  id: number;
  teleId: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  dateOfBirth: Date;
  role: string;
  accountNumber: number;
  accountBalance: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
 
 };

class UserModel extends Model<UserInterface> implements UserInterface {
  public id: number;
  public teleId: string;
  public fullName: string;
  public phoneNumber: string;
  public password: string;
  public dateOfBirth: Date;
  public role: string;
  public accountNumber: number;
  public accountBalance: number;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;

  static readonly CREATABLE_PARAMETERS = ['employeeCode', 'departmentId', 'positionId', 'password', 'fullName', 'phoneNumber', 'email', 'role', 'status', 'dateIn', 'dateOut'];
  public static readonly UPDATABLE_PARAMETERS = ['fullName', 'employeeCode', 'dateOfBirth', 'departmentId', 'positionId', 'phoneNumber', 'address', 'dateIn', 'dateOut', 'gender', 'status', 'role', 'description', 'password']
  public static readonly USER_UPDATABLE_PARAMETERS = ['fullName', 'employeeCode', 'dateOfBirth', 'departmentId', 'positionId', 'phoneNumber', 'address', 'dateIn', 'dateOut', 'gender', 'description']
  public static readonly TYPE_ENUM ={ ADMIN: 'admin', USER: 'user' };

  public static initialize (sequelize: Sequelize) {
    this.init(UserEntity, {
      tableName: 'users',
      sequelize,
      paranoid: true,
    });
  }

  public static associate () {
     
  }
}

export default UserModel;
