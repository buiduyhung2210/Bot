
import { Sequelize } from "sequelize";
import User from "../db/models/user";


const createUser = async (req: {teleId:string,fullName:string,password:string}) => {
	try {
		const [user,create] = await User.findOrCreate({
			where:{teleId: req.teleId},
			defaults:{
				teleId: req.teleId,
				fullName: req.fullName,
				password:req.password
			}
		});
		return create;
	} catch (error) {
		console.log(error)
	}
}

const getUser = async (req: {teleId:string}) =>{
	try {
		const user = await User.findOne({
			where:{teleId:req.teleId}
		})
		return user
	} catch (error) {
		console.log(error)
	}
}
const  updateBalance = async (req:{teleId:string,money:number}) =>{
	try {
		const user = await User.update({balance: Sequelize.literal(`balance + ${req.money}`)},{
			where:{teleId:req.teleId}
		})
	} catch (error) {
		console.log(error)
	}
}
const updateLogin = async (req:{teleId:string,isLogin:boolean}) =>{
	try{
		const user = await User.update({isLogin:req.isLogin},{where:{teleId:req.teleId}})
	}
	catch(error){
		console.log(error);
	}
}

export default { createUser, getUser, updateBalance,updateLogin};