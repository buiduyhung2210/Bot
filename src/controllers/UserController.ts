import { raw } from "express";
import { Sequelize } from "sequelize";
import User from "../db/models/user";
import bcrypt from "bcryptjs";
const twilio = require("twilio");


const createUser = async (req: { teleId: string, fullName: string, password: string }) => {
	try {
		const [user, create] = await User.findOrCreate({
			where: { teleId: req.teleId },
			defaults: {
				teleId: req.teleId,
				fullName: req.fullName,
				password: req.password,
			}
		});
		return create;
	} catch (error) {
		console.log(error)
	}
}

const getUser = async (req: { teleId: string }) => {
	try {
		const user = await User.findOne({
			where: { teleId: req.teleId }
		})
		return user
	} catch (error) {
		console.log(error)
	}
}
const updateBalance = async (req: { teleId: string, money: number }) => {
	try {
		const user = await User.update({ balance: req.money }, {
			where: { teleId: req.teleId }
		})
	} catch (error) {
		console.log(error)
	}
}
const updateLogin = async (req: { teleId: string }, isLogin: boolean) => {
	try {
		const user = await User.update({ isLogin }, { where: { teleId: req.teleId } })
	}
	catch (error) {
		console.log(error);
	}
}

const hashCode = (password: string) => bcrypt.hashSync(password, bcrypt.genSaltSync(8));
const validatePassword = (password: string) => {
	if (password.length < 8) {
		return false;
	}
	// Check for at least 1 letter, 1 special character and 1 digit character
	const letterRegex = /[a-zA-Z]/;
	const specialRegex = /\W/;
	const digitRegex = /\d/;
	if (!specialRegex.test(password) || !letterRegex.test(password) || !digitRegex.test(password)) {
		return false;
	}
	return true;
}
const generateOTP = (): string => {
	const digits = '0123456789';
	let OTP = '';
	for (let i = 0; i < 4; i++) {
		OTP += digits[Math.floor(Math.random() * 10)];
	}
	return OTP;
}
async function sendSMS(phoneNumber: string, otp: string) {
	const client = new twilio(process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTHTOKEN);
	return client.messages
		.create({
			body: `Your otp code is : ${otp}`,
			from: '+14752675217',
			to: `${phoneNumber}`
		})
		.then((message: any) => {
			console.log(message.sid);
		})
		.catch((error: Error) => {
			console.log(error);
		});

}


export default { createUser, getUser, updateBalance, updateLogin, hashCode, validatePassword, generateOTP, sendSMS };