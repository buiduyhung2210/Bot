import express, { raw, Request, response, Response } from "express";
import UserController from "./controllers/UserController";
import TransactionController from "./controllers/TransactionController";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Telegraf, Scenes, session,Markup } from 'telegraf';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN)
const { Stage, WizardScene } = Scenes;

// const helpMessage = `
// Say something to me
// /start - start bot
// /help - more command
// /login - login
// /register -register
// /balance - check your balance
// /transfer - transfer money
// /history - transaction history
// `;

bot.start((ctx) => {
	bot.telegram.sendMessage(ctx.from.id,'Hi i am a cool bot');
})

// bot.help((ctx) => bot.telegram.sendMessage(ctx.from.id,helpMessage))
bot.action('balance', async (ctx) => {
	const data = { teleId: ctx.from.id + '' };
	const user = await UserController.getUser(data);
	if (user) {
		if(user.isLogin){
			bot.telegram.sendMessage(ctx.from.id,`UserName: ${user.fullName}\nteleId:${user.teleId}\nCreatedAt: ${user.createdAt}\nAccountBalance: ${user.balance}`);
		}
		else{
			bot.telegram.sendMessage(ctx.from.id,'Please login your account!');
		}
	}
	else {
		bot.telegram.sendMessage(ctx.from.id,'You don\'t have account. Please create a new account!')
	}
})
bot.command('history',async (ctx) =>{
	const transHistory = await TransactionController.getTransactions({sendId:ctx.from.id+''});
	if(transHistory.length ===0){
		bot.telegram.sendMessage(ctx.from.id,'You have not made any transactions yet!');
	}
	else {
		bot.telegram.sendMessage(ctx.from.id,transHistory.join('\n'));
	}
})
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transferByIdWizard = new WizardScene('transfer-by-id',
	async (ctx: any) => {
		const user = await UserController.getUser({teleId:ctx.from.id+''});
		ctx.session.balance  = user.balance;
		if(!user.isLogin){
			let message ='Please login your account!'
			ctx.deleteMessage();
			bot.telegram.sendMessage(ctx.chat.id,message,{
				reply_markup:{
					inline_keyboard:[
						[{text: 'Back to menu', callback_data:'Back to menu'}]
					]
				}
			})
			return ctx.scene.leave();
		}
		else {
			let message ='Please enter reciver ID'
			ctx.deleteMessage();
			bot.telegram.sendMessage(ctx.chat.id,message,{
				reply_markup:{
					inline_keyboard:[
						[{text: 'Back to menu', callback_data:'Back to menu'}]
					]
				}
			})

		}
		return ctx.wizard.next();
	},
	async (ctx) => {
		const reciver = await UserController.getUser({ teleId: ctx.message.text + '' });
		// const inlineKeyboards = Markup.inlineKeyboard([
		// 	Markup.button.callback('Confirm','confirm'),
		// 	Markup.button.callback('Cancel','cancel')
		// ])
		if (reciver && reciver.teleId!= ctx.from.id) {
			let message ='Please enter amount of money'
			ctx.deleteMessage();
			bot.telegram.sendMessage(ctx.chat.id,message,{
				reply_markup:{
					inline_keyboard:[
						[{text: 'Back to menu', callback_data:'Back to menu'}]
					]
				}
			})
			ctx.session.reciver = reciver.dataValues
			return ctx.wizard.next();
		}
		else {
			let message ='Invalid ID. Please try again.'
			ctx.deleteMessage();
			bot.telegram.sendMessage(ctx.chat.id,message,{
				reply_markup:{
					inline_keyboard:[
						[{text: 'Back to menu', callback_data:'Back to menu'}]
					]
				}
			})
			// return ctx.wizard.selectStep(3);
		}
	},

	async (ctx) => {
		const data = { teleId: ctx.from.id + '' };
		const user = await UserController.getUser(data);
		if (parseInt(ctx.message.text) > user.balance || parseInt(ctx.message.text) <= 0) { bot.telegram.sendMessage(ctx.from.id,'Invalid balance'); return }
		else {
			ctx.session.amount = ctx.message.text;
			const otp =UserController.generateOTP();;
			ctx.session.otp = otp;

			UserController.sendSMS(user.phoneNumber,otp);
			bot.telegram.sendMessage(ctx.from.id,'Please enter otp code: ');
			
		}
		return ctx.wizard.next();

	},
	async (ctx) =>{
		if(ctx.message?.text===ctx.session.otp){
			const reciver = ctx.session.reciver;

			const amount = ctx.session.amount;
			await UserController.updateBalance({ teleId: reciver.teleId, money: reciver.balance + parseInt(amount) });
			await UserController.updateBalance({ teleId: ctx.from.id, money: ctx.session.balance - parseInt(amount) })
			// bot.telegram.sendMessage(reciver.teleId,'successful transaction');
			const trans = {
				sendId:ctx.from.id+'',
				receiveId:reciver.teleId,
				amount: amount,
				balanceSend: ctx.session.balance - parseInt(amount),
				balanceReceive: reciver.balance + parseInt(amount)
			}
			await TransactionController.createTransaction(trans);
			bot.telegram.sendMessage(ctx.from.id,'successful transaction');
		}
		else {
			bot.telegram.sendMessage(ctx.from.id,'Otp code is incorrect. Please try again!');
			return;
		}
		return ctx.scene.leave();
		}
	);


const registerWizard = new WizardScene('register-wizard',
	async (ctx:any) =>{
		await ctx.telegram.sendMessage(ctx.chat.id, "Please share your phone number", {
			parse_mode: "Markdown",
			reply_markup: {
			  one_time_keyboard: true,
			  resize_keyboard:true,
			  keyboard: [
				[
				  {
					text: "Confirm",
					request_contact: true,
				  },
				  {
					text: "Cancel",
				  },
				],
			  ],
			  force_reply: true,
			},
		  });

		  return ctx.wizard.next();
		},
		 (ctx) => {
			// Check user response 
			if(ctx.message.contact?.phone_number){
				ctx.session.phoneNumber = ctx.message.contact.phone_number;
				bot.telegram.sendMessage(ctx.from.id,'Please enter your password(at least 8 characters, 1 letter and 1 special character)');
				return ctx.wizard.next(); // Move to the next step in the wizard
			} else if(ctx.message.text === 'Cancel'){
				// User chose to cancel the registration process
				 bot.telegram.sendMessage(ctx.from.id,'Okay, maybe another time!');
				return ctx.scene.leave(); // End the wizard scene
			} else {
				// User did not choose any of the keyboard options
				 bot.telegram.sendMessage(ctx.from.id,"Please use the buttons provided");
			}
		},
	async (ctx) => {
		if (UserController.validatePassword(ctx.message.text)) {
			console.log(ctx.session.phoneNumber);
			const data = {
				teleId: ctx.from.id,
				fullName: ctx.from.first_name + ctx.from.last_name,
				phoneNumber: ctx.session.phoneNumber+'',
				password: UserController.hashCode(ctx.message.text)
			};
			const create = await UserController.createUser(data);
			if (create) {
				bot.telegram.sendMessage(ctx.from.id,'successfully!');
			}
			else {
				bot.telegram.sendMessage(ctx.from.id,'failed! account is used.');
			}
			return ctx.scene.leave();
		}
		else {
			bot.telegram.sendMessage(ctx.from.id,'Invalid password. Please try again.');
			return;
		}
	});


const loginWizard = new WizardScene('login-wizard',
	async (ctx: any) => {
		const user = await UserController.getUser({ teleId: ctx.from.id + '' });
		const isRegister = user != null ? true : false;
		if (isRegister && !user.isLogin) {
			let message ='Please enter your password'
			bot.telegram.sendMessage(ctx.chat.id,message,{
			reply_markup:{
				inline_keyboard:[
					[{text: 'Back to menu', callback_data:'Back to menu'}]
				]
			}
		})
			//   Save user in ctx.session
			ctx.session.user = user;
			console.log(ctx.session.user);
			return ctx.wizard.next();
		}
		else if (user.isLogin){
			let message ='Login fail! You are logged in'
			bot.telegram.sendMessage(ctx.chat.id,message,{
			reply_markup:{
				inline_keyboard:[
					[{text: 'Back to menu', callback_data:'Back to menu'}]
				]
			}
		})
			return ctx.scene.leave();
		}
		else {
			let message ='You don\'t have account. Please /register a new account!'
			bot.telegram.sendMessage(ctx.chat.id,message,{
			reply_markup:{
				inline_keyboard:[
					[{text: 'Back to menu', callback_data:'Back to menu'}]
				]
			}
		})
			return ctx.scene.leave();
		}
	},
	async (ctx) => {
		// Get user from session
		const user = ctx.session.user;
		const isPassword = bcrypt.compareSync(ctx.message.text, user.password);
		if (isPassword) {
			await UserController.updateLogin({ teleId: user.teleId + '',isLogin:true });
			let message ='Login successful'
			bot.telegram.sendMessage(ctx.chat.id,message,{
			reply_markup:{
				inline_keyboard:[
					[{text: 'Back to menu', callback_data:'Back to menu'}]
				]
			}
		})
			return ctx.scene.leave();
		}
		else {
			let message ='Your password is incorrect'
			bot.telegram.sendMessage(ctx.chat.id,message,{
			reply_markup:{
				inline_keyboard:[
					[{text: 'Back to menu', callback_data:'Back to menu'}]
				]
			}
		})
			return;
		}
	}
);

const faces = ['Bầu', 'Tôm', 'Cua', 'Cá', 'Nai', 'Gà'];
const selectedFaces: string[] = [];
let bet =0
const eventWizard = new WizardScene('event-wizard',
	async (ctx: any) => {
		const user = await UserController.getUser({teleId:ctx.from.id+''});
		ctx.session.balance  = user.balance;
			if (!user.isLogin){
				bot.telegram.sendMessage(ctx.from.id,'Please login your account!');
				return ctx.scene.leave();
			}
			else{ 
				await bot.telegram.sendMessage(ctx.from.id,'Welcome to the game earn money');
				await bot.telegram.sendMessage(ctx.from.id, 'Enter 1 side bet amount: ')
				return ctx.wizard.next();
			}},
	async(ctx)=>{
		const user = await UserController.getUser({teleId:ctx.from.id+''});
		bet = parseInt(ctx.message.text);
		if (parseInt(ctx.message.text)*3 > user.balance || parseInt(ctx.message.text) <= 0){
			await bot.telegram.sendMessage(ctx.from.id,'Invalid balance');
			return ctx.scene.leave(); 
		}else{
			await UserController.updateBalance({ teleId: ctx.from.id, money: user.balance- (bet*3) })
			bot.telegram.sendMessage(ctx.from.id,'Choose 3 faces')
			return ctx.wizard.next();
		}
	},

	async (ctx) => {
			await bot.telegram.sendMessage(ctx.from.id,'Choose 3 faces')
    		const selectedFace = ctx.message.text;
  			if (!selectedFaces.includes(selectedFace)) {
    			selectedFaces.push(selectedFace);
    			await ctx.reply(`Bạn đã chọn ${selectedFace}`);
  			}else {
    			ctx.reply(`${selectedFace} đã được chọn trước đó!`);
  			}
  		if (selectedFaces.length === 3) {
    	rollDice(ctx);}

		function rollDice(ctx:any) {
		const diceFaces = ['Bầu', 'Tôm', 'Cua', 'Cá', 'Nai', 'Gà'];
		const result = [];
		for (let i = 0; i < 3; i++) {
	  		const randomIndex = Math.floor(Math.random() * diceFaces.length);
	  		result.push(diceFaces[randomIndex]);
		}
		const count = result.filter((face) => selectedFaces.includes(face)).length;
		let message = `Kết quả quay xúc xắc: ${result.join(', ')}\n`;
		if (count > 0) {
	  		const prize = count*bet ;
	  		message += `Bạn trúng giải ${count} ô và nhận được ${prize} VNĐ! 🎉`;
			UserController.updateBalance({ teleId: ctx.from.id, money: ctx.session.balance + prize })

		} else {
	  		message += 'Rất tiếc, bạn không trúng giải nào! 😔';
		}
		ctx.reply(message);
		selectedFaces.length = 0;
		return ctx.scene.leave();
  }
}
);


bot.hears('hi', (ctx) => bot.telegram.sendMessage(ctx.from.id,'Hey there'));
const stage = new Stage([registerWizard, loginWizard, transferByIdWizard,eventWizard]);

bot.use(session());
bot.use(stage.middleware());


bot.action('register', (Stage.enter as any)('register-wizard'));
bot.action('login', (Stage.enter as any)('login-wizard'));
bot.action('transfer', (Stage.enter as any)('transfer-by-id'));
bot.command('event', (Stage.enter as any)('event-wizard'));
bot.command('help',ctx=> {
	bot.telegram.sendMessage(ctx.chat.id,'Help',{
		reply_markup:{
			inline_keyboard:[
				[{text: 'See list help', callback_data: 'Click'}]
			]
		}
	})
})


bot.action('Click', ctx =>{
	ctx.deleteMessage();
	bot.telegram.sendMessage(ctx.chat.id,'Help list',{
		reply_markup:{
			inline_keyboard:[
			[{text: 'login',callback_data: 'login'},
			{text: 'register',callback_data: 'register'}],
			[{text: 'balance',callback_data: 'balance'},
			{text: 'transfer',callback_data: 'transfer'}],
			[{text: 'Back to menu', callback_data:'Back to menu'}]					
			]
		}
	} )
})
bot.action('Back to menu',ctx=> {
	ctx.deleteMessage();
	bot.telegram.sendMessage(ctx.chat.id,'help',{
		reply_markup:{
			inline_keyboard:[
				[{text: 'See list help', callback_data: 'Click'}]
			]
		}
	} )
})

bot.launch();


app.listen(process.env.APP_PORT, () => {
	console.log((`${process.env.APP_NAME} running on port ${process.env.APP_PORT}`))
});