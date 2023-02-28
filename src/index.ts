import express, { raw, Request, Response } from "express";
import UserController from "./controllers/UserController";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Telegraf, Scenes, session } from 'telegraf';
import TransactionController from "./controllers/TransactionController";

dotenv.config();



const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const storeItems = new Map([
	[1, { price: 1000, name: "10$" }],
	[2, { price: 2000, name: "20$" }],
	[3, { price: 5000, name: "50$" }],
	[4, { price: 10000, name: "100$" }],
	[5, { price: 20000, name: "200$" }],
	[6, { price: 50000, name: "500$" }],
])

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

const bot = new Telegraf(process.env.BOT_TOKEN)
const { Stage, WizardScene } = Scenes;

const helpMessage = `
Say something to me
/start - start bot
/help - more command
/login - login
/register -register
/balance - check your balance
/transfer - transfer money
`;
const topUp = `
Chose money to top up
Type 1 for 10$
Type 2 for 20$
Type 3 for 50$
Type 4 for 100$
Type 5 for 200$
Type 6 for 500$
`;

bot.start((ctx) => {
	ctx.reply('Hi i am a cool bot');
	ctx.reply('/help for more command')

})
/* bot.help((ctx) => ctx.reply(helpMessage)) */
bot.command('balance', async (ctx) => {
	const data = { teleId: ctx.from.id + '' };
	const user = await UserController.getUser(data);
	if (user) {
		ctx.reply(`UserName: ${user.fullName}\nteleId:${user.teleId}\nCreatedAt: ${user.createdAt}\nAccountBalance: ${user.balance}`);
	}
	else {
		ctx.reply('You don\'t have account. Please create a new account!')
	}
})
bot.command('history', async (ctx) => {
	const transHistory = await TransactionController.getTransactions({ sendId: ctx.from.id + '' });
	if (transHistory.length === 0) {
		bot.telegram.sendMessage(ctx.from.id, 'You have not made any transactions yet!');
	}
	else {
		bot.telegram.sendMessage(ctx.from.id, transHistory.join('\n'));
	}
})

const topup = new WizardScene('topup',
	async (ctx: any) => {
		const data = { teleId: ctx.from.id + '' };
		const user = await UserController.getUser(data);
		if (user) {
			ctx.reply(topUp)
			return ctx.wizard.next();
		}
		else {
			ctx.reply('You don\'t have account. Please create a new account!')
		}
	},

	async (ctx) => {
		const storeItem = storeItems.get(parseInt(ctx.message.text))

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [

				{
					price_data: {
						currency: "usd",
						unit_amount: storeItem.price,
						product_data: {
							name: storeItem.name,
						},
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: "http://localhost:3000/success",
			cancel_url: "http://localhost:3000/cancel",
		});
		ctx.reply(session.url)
		ctx.session.price = storeItem.price
		const data = { teleId: ctx.from.id + '' };
		const user = await UserController.getUser(data);
		await UserController.updateBalance({ teleId: ctx.from.id, money: user.balance + parseInt(ctx.session.price) / 100 })
		return ctx.scene.leave();
	},
);




const transferByIdWizard = new WizardScene('transfer-by-id',
	(ctx: any) => {
		ctx.reply('Please enter reciver ID');
		return ctx.wizard.next();
	},
	async (ctx) => {
		const reciver = await UserController.getUser({ teleId: ctx.message.text + '' });

		if (reciver) {
			ctx.reply('Please enter amount of money');
			ctx.session.reciver = reciver.dataValues
			return ctx.wizard.next();
		}
		else {
			ctx.reply('Invalid ID. Please try again.');
			return;
		}
	},
	async (ctx) => {
		const data = { teleId: ctx.from.id + '' };
		const user = await UserController.getUser(data);
		const reciver = ctx.session.reciver
		console.log(reciver)
		if (parseInt(ctx.message.text) > user.balance || parseInt(ctx.message.text) < 0) { ctx.reply('Invalid balance'); return }
		else {
			await UserController.updateBalance({ teleId: reciver.teleId, money: reciver.balance + parseInt(ctx.message.text) });
			await UserController.updateBalance({ teleId: ctx.from.id, money: user.balance - parseInt(ctx.message.text) })
			await TransactionController.createTransaction({ sendId: user.teleId, receiveId: reciver.teleId, amount: parseInt(ctx.message.text), balanceSend: parseInt(ctx.message.text), balanceReceive: parseInt(ctx.message.text) })
		}
		return ctx.scene.leave();

	});


const registerWizard = new WizardScene('register-wizard',
	(ctx: any) => {
		ctx.reply('Please enter your password(at least 8 characters, 1 letter and 1 special character)');
		return ctx.wizard.next();
	},
	async (ctx) => {
		if (validatePassword(ctx.message.text)) {
			const data = {
				teleId: ctx.from.id,
				fullName: ctx.from.first_name + ctx.from.last_name,
				password: hashCode(ctx.message.text)
			};
			const create = await UserController.createUser(data);
			if (create) {
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
	async (ctx: any) => {
		const user = await UserController.getUser({ teleId: ctx.from.id + '' });
		const isRegister = user != null ? true : false;
		if (isRegister) {
			ctx.reply('Please enter your password');
			//   Save user in ctx.session
			ctx.session.user = user;
			console.log(ctx.session.user);
			return ctx.wizard.next();
		}
		else {
			ctx.reply('You don\'t have account. Please /register a new account!');
			return ctx.scene.leave();
		}
	},
	async (ctx) => {
		// Get user from session
		const user = ctx.session.user;
		const isPassword = bcrypt.compareSync(ctx.message.text, user.password);
		if (isPassword) {
			await UserController.updateLogin({ teleId: user.teleId + '' }, true);
			ctx.reply('Login successful');
			return ctx.scene.leave();
		}
		else {
			ctx.reply('Your password is incorrect');
			return;
		}
	}
);

const faces = ['Bầu', 'Tôm', 'Cua', 'Cá', 'Nai', 'Gà'];
const selectedFaces: string[] = [];
let bet = 0
const eventWizard = new WizardScene('event-wizard',
	async (ctx: any) => {
		const user = await UserController.getUser({ teleId: ctx.from.id + '' });
		ctx.session.balance = user.balance;
		if (!user.isLogin) {
			bot.telegram.sendMessage(ctx.from.id, 'Please login your account!');
			return ctx.scene.leave();
		}
		else {
			await bot.telegram.sendMessage(ctx.from.id, 'Welcome to the game earn money');
			await bot.telegram.sendMessage(ctx.from.id, 'Enter 1 side bet amount: ')
			return ctx.wizard.next();
		}
	},
	async (ctx) => {
		const user = await UserController.getUser({ teleId: ctx.from.id + '' });
		bet = parseInt(ctx.message.text);
		if (parseInt(ctx.message.text) * 3 > user.balance || parseInt(ctx.message.text) <= 0) {
			await bot.telegram.sendMessage(ctx.from.id, 'Invalid balance');
			return ctx.scene.leave();
		} else {
			await UserController.updateBalance({ teleId: ctx.from.id, money: user.balance - (bet * 3) })
			bot.telegram.sendMessage(ctx.from.id, 'Choose 3 faces')
			return ctx.wizard.next();
		}
	},

	async (ctx) => {
		await bot.telegram.sendMessage(ctx.from.id, 'Choose 3 faces')
		const selectedFace = ctx.message.text;
		if (!selectedFaces.includes(selectedFace)) {
			selectedFaces.push(selectedFace);
			await ctx.reply(`Bạn đã chọn ${selectedFace}`);
		} else {
			ctx.reply(`${selectedFace} đã được chọn trước đó!`);
		}
		if (selectedFaces.length === 3) {
			rollDice(ctx);
		}

		function rollDice(ctx: any) {
			const diceFaces = ['Bầu', 'Tôm', 'Cua', 'Cá', 'Nai', 'Gà'];
			const result = [];
			for (let i = 0; i < 3; i++) {
				const randomIndex = Math.floor(Math.random() * diceFaces.length);
				result.push(diceFaces[randomIndex]);
			}
			const count = result.filter((face) => selectedFaces.includes(face)).length;
			let message = `Kết quả quay xúc xắc: ${result.join(', ')}\n`;
			if (count > 0) {
				const prize = count * bet;
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


bot.hears('hi', (ctx) => bot.telegram.sendMessage(ctx.from.id, 'Hey there'));
const stage = new Stage([registerWizard, loginWizard, transferByIdWizard, eventWizard, topup]);

bot.use(session());
bot.use(stage.middleware());


bot.action('register', (Stage.enter as any)('register-wizard'));
bot.action('login', (Stage.enter as any)('login-wizard'));
bot.action('transfer', (Stage.enter as any)('transfer-by-id'));
bot.action('topup', (Stage.enter as any)('topup'));
bot.command('event', (Stage.enter as any)('event-wizard'));
bot.command('help', ctx => {
	bot.telegram.sendMessage(ctx.chat.id, 'Help', {
		reply_markup: {
			inline_keyboard: [
				[{ text: 'See list help', callback_data: 'Click' }]
			]
		}
	})
})


bot.action('Click', ctx => {
	ctx.deleteMessage();
	bot.telegram.sendMessage(ctx.chat.id, 'Help list', {
		reply_markup: {
			inline_keyboard: [
				[{ text: 'login', callback_data: 'login' },
				{ text: 'register', callback_data: 'register' }],
				[{ text: 'balance', callback_data: 'balance' },
				{ text: 'transfer', callback_data: 'transfer' }],
				[{ text: 'topup', callback_data: 'topup' }, { text: 'event', callback_data: 'event' }],
				[{ text: 'Back to menu', callback_data: 'Back to menu' }]
			]
		}
	})
})
bot.action('Back to menu', ctx => {
	ctx.deleteMessage();
	bot.telegram.sendMessage(ctx.chat.id, 'help', {
		reply_markup: {
			inline_keyboard: [
				[{ text: 'See list help', callback_data: 'Click' }]
			]
		}
	})
})

bot.launch();
const app = express();
app.use(express.json());

app.listen(process.env.APP_PORT, () => {
	console.log((`${process.env.APP_NAME} running on port ${process.env.APP_PORT}`))
});