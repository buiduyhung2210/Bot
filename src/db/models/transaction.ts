import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";

interface TransactionAttributes {
  id?: number,
  sendId?: string | null,
  receiveId: string | null,
  amount?: number,
  createdAt?: Date,
  updatedAt?: Date
}

export interface TransactionInput extends Optional<TransactionAttributes, 'id'> { }
export interface TransactionOutput extends Required<TransactionAttributes> { }

class Transaction extends Model<TransactionAttributes, TransactionInput> implements TransactionAttributes {
  public id!: number;
  public sendId!: string;
  public receiveId!: string;
  public amount?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  sendId: {
    type: DataTypes.STRING
  },
  
  receiveId: {
    type: DataTypes.STRING
  },
  amount: {
    type: DataTypes.NUMBER,
    defaultValue: 0,
  },
  
}, {
  timestamps: true,
  sequelize: connection,
  underscored: false,
  tableName: "User"
});

export default Transaction;