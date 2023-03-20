import express, { Request, Response } from "express";
import UserController from "./controllers/UserController";
import bcrypt from "bcryptjs"
import dotenv from "dotenv";
import { Telegraf,Scenes, session } from 'telegraf';
dotenv.config();
const hashCode  = (password:string) => bcrypt.hashSync(password,bcrypt.genSaltSync(8));
const validatePassword = (password:string) =>{
	if(password.length<8){
	  return false;
	}
	// Check for at least 1 letter, 1 special character and 1 digit character
	const letterRegex = /[a-zA-Z]/;
	const specialRegex = /\W/;
	const digitRegex = /\d/;
	if(!specialRegex.test(password) || !letterRegex.test(password) || !digitRegex.test(password)){
	  return false;
	}
	return true;
  }

const bot = new Telegraf(process.env.BOT_TOKEN)
const {Stage,WizardScene} = Scenes;


bot.start((ctx) => {
	ctx.reply('Welcome');
	console.log(ctx);

})
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.command('balance', async (ctx)=>{
	const data = {teleId:ctx.from.id+''};
	const user = await UserController.getUser(data);
	if(user){
	  ctx.reply(`UserName: ${user.fullName}\nteleId:${user.teleId}\nCreatedAt: ${user.createdAt}\nAccountBalance: ${user.balance}`);
	}
	else{
	  ctx.reply('You don\'t have account. Please create a new account!')
	}
  })

const registerWizard = new WizardScene('register-wizard',
	(ctx:any) => {
	ctx.reply('Please enter your password(at least 8 characters, 1 letter and 1 special character)');
	return ctx.wizard.next();
	},
	async (ctx) =>{
	if (validatePassword(ctx.message.text)) {
		const data ={
			teleId: ctx.from.id,
			fullName: ctx.from.first_name+ctx.from.last_name,
			password: hashCode(ctx.message.text)
			};
		const create = await UserController.createUser(data);
		if(create){
		ctx.reply('successfully!');
		} 
		else {
		ctx.reply('failed! account is used.');
		}
	return ctx.scene.leave();
	} 
	else {
	ctx.reply('Invalid password. Please try again.');
	return;
	}
});
const loginWizard = new WizardScene('login-wizard',
	async (ctx:any) =>{
	const user = await UserController.getUser({teleId: ctx.from.id+''});
	const isRegister = user!=null?true:false;
	if(isRegister){
		ctx.reply('Please enter your password');
	//   Save user in ctx.session
		ctx.session.user = user;
		console.log(ctx.session.user);
		return ctx.wizard.next();
	}
	else{
		ctx.reply('You don\'t have account. Please /register a new account!');
		return ctx.scene.leave();
	}
	},
	async (ctx) =>{
	// Get user from session
	const user = ctx.session.user;
	const isPassword = bcrypt.compareSync(ctx.message.text,user.password);
			if(isPassword){
			await UserController.updateLogin({ teleId:user.teleId+'' },true);
			ctx.reply('Login successful');
			return ctx.scene.leave();
			}
			else{
			ctx.reply('Your password is incorrect');
			return;
			}
	}
);
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
const stage = new Stage([registerWizard,loginWizard]);

bot.use(session());
bot.use(stage.middleware());
bot.command('register', (Stage.enter as any)('register-wizard'));
bot.command('login', (Stage.enter as any)('login-wizard'));

bot.launch();
const app = express();
app.use(express.json());

app.listen(process.env.APP_PORT, () => {
	console.log((`${process.env.APP_NAME} running on port ${process.env.APP_PORT}`))
});