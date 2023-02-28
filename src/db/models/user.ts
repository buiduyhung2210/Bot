import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

interface UserAttributes {
  id?: number,
  Name?: string | null,
  teleId: string | null,
  balance?: number,

  createdAt?: Date,
  updatedAt?: Date
}

export interface UserInput extends Optional<UserAttributes, 'id'> { }
export interface UserOutput extends Required<UserAttributes> { }

class User extends Model<UserAttributes, UserInput> implements UserAttributes {
  public id!: number;
  public Name!: string;
  public teleId!: string;
  public balance?: number;


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
  Name: {
    allowNull: true,
    type: DataTypes.STRING
  },
  teleId: {
    unique: true,
    type: DataTypes.STRING
  },
  balance: {
    type: DataTypes.NUMBER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
  sequelize: connection,
  underscored: false,
  tableName: "User"
});

export default User;