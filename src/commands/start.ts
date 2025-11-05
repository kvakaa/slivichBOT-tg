import { InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";
import { User } from "../models/User.js";

export const start = async (ctx:MyContext) =>{
  if (!ctx.from) {
    return ctx.reply("User information is missing.");
  }

  const {id, first_name, username} = ctx.from;

  try {
    const keyboard = new InlineKeyboard().text("Меню", "menu");

    const existingUser = await User.findOne({telegramId : id});
    if (existingUser) {
       return ctx.reply("Вы уже зарегистрированы в боте.", {reply_markup: keyboard});
       
    }

    const newUser = new User({
      telegramId: id,
      firstName: first_name,
      username: username,
    })
    newUser.save();
    return ctx.reply("Вы успешно зарегистрированы в боте.",{reply_markup: keyboard});
  } catch (error) {
    console.error("Ошибка при регистрации пользователя:", error);
    return ctx.reply("Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.");
  }
}