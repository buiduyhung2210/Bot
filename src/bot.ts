require('dotenv').config();
import {Telegraf} from "telegraf";
let username='cool_tele_bot'
let bot = new Telegraf(process.env.BOT_TOKEN)
export function Bot() {
  bot.start((text) => {
    text.reply("Hi i am CoolBot ")
  });
  bot.help((text) => {
    text.reply(" What can i help ? ")
  });
  bot.hears('leminhkhoi', (ctx) => {
    ctx.reply('gau gau ang ang');
    console.log(ctx);
  });
  
  bot.launch();
  console.log('11111')
}



