import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

interface UserAttributes {
  id?: number,
  fullName?: string | null,
  teleId: string | null,
  balance?: number,
  password?: string,
  isLogin?: boolean,
  createdAt?: Date,
  updatedAt?: Date
}

export interface UserInput extends Optional<UserAttributes, 'id'> { }
export interface UserOutput extends Required<UserAttributes> { }

class User extends Model<UserAttributes, UserInput> implements UserAttributes {
  public id!: number;
  public fullName!: string;
  public teleId!: string;
  public balance?: number;
  public password!: string;
  public isLogin?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  fullName: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  teleId: {
    unique: true,
    type: DataTypes.STRING
  },
  balance: {
    type: DataTypes.NUMBER,
    defaultValue: 0,
  },
  isLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  sequelize: connection,
  underscored: false,
  tableName: "user"
});

export default User;