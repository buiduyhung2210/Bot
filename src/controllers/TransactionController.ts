import { Op, Sequelize } from "sequelize";
import Transaction from "../db/models/transaction";

const createTransaction = async (req: { sendId: string, receiveId: string, amount:number,balanceSend:number,balanceReceive:number }) => {
	try {
		const create = await Transaction.create({
				sendId: req.sendId,
				receiveId: req.receiveId,
				amount: req.amount,
                balanceSend:req.balanceSend,
                balanceReceive: req.balanceReceive
		});
		return create;
	} catch (error) {
		console.log(error)
	}
}

const getTransactions = async (req: { sendId: string }) => {
    // get less than 10 transactions (transfer or receive money)
    let myTransactions:Array<string> =[];
    try{
        const transactions = await Transaction.findAll({where:{
                [Op.or]: [
                  { sendId: req.sendId },
                  { receiveId: req.sendId }
                ]
        },limit:10})
        myTransactions = transactions.map(transaction => {
            if (transaction.sendId===req.sendId){
                return `Tk: ${transaction.sendId}|GD: -${transaction.amount}\n${transaction.createdAt}|SD: ${transaction.balanceSend}`
            }
            else{
                return `Tk: ${transaction.receiveId}|GD: +${transaction.amount}\n${transaction.createdAt}|SD: ${transaction.balanceReceive}`
            }
        })
        
        return myTransactions;
    }
    catch(error){
        console.log(error);
    }
    
}


export default { createTransaction,getTransactions };
