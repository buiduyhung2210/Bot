import { BelongsToManySetAssociationsMixin, Model, ModelScopeOptions, ModelValidateOptions, Op, Sequelize, Transaction, ValidationErrorItem } from 'sequelize';
import { ModelHooks } from 'sequelize/types/lib/hooks';
import UserInterface from '../interfaces/users';
import UserEntity from '../entities/users';




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
  static readonly hooks: Partial<ModelHooks<UserModel>> = {
  
  }

  static readonly validations: ModelValidateOptions = {
  
  }

  static readonly scopes: ModelScopeOptions = {
 
  }
 
  public static initialize (sequelize: Sequelize) {
    this.init(UserEntity, {
      hooks: UserModel.hooks,
      scopes: UserModel.scopes,
      validate: UserModel.validations,
      tableName: 'users',
      sequelize,
      paranoid: true,
    });
  }

  public static associate () {
     
  }
}

export default UserModel;
