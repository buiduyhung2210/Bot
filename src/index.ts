import express, { Request, Response } from "express";
import UserController from "./controllers/UserController";

import dotenv from "dotenv";
const { Telegraf } = require('telegraf')
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN)



bot.start((ctx: any) => {
	ctx.reply('Welcome');
	console.log(ctx);

})
bot.help((ctx: any) => ctx.reply('Send me a sticker'))

bot.command('signin', (ctx: any) => {

	const Data = {
		teleId: ctx.from.id,
		fullName: ctx.from.first_name,
	}
	console.log(Data)
	const user = UserController.CreateUser(Data)
	if (!user) ctx.reply('fail');
	ctx.reply('ok');


})




bot.on('sticker', (ctx: any) => ctx.reply('👍'))
bot.hears('hi', (ctx: any) => ctx.reply('Hey there'))
bot.launch()














const app = express();
app.use(express.json());



app.listen(process.env.APP_PORT, () => {
	console.log((`${process.env.APP_NAME} running on port ${process.env.APP_PORT}`))
});