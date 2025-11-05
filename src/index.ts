import 'dotenv/config';
import {Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import mongoose from 'mongoose';
import { hydrate } from '@grammyjs/hydrate';
import { MyContext } from './types.js';
import { start } from './commands/index.js';




const BOT_API_KEY = process.env.BOT_TOKEN;
if (!BOT_API_KEY) {
  throw new Error('BOT_API_KEY is not defined');
}

const bot = new Bot<MyContext>(BOT_API_KEY);
bot.use(hydrate());

// Ответ на команду /start
// bot.api.config.use((prev, method, payload, signal) => {
//   if (method === "sendMessage" || method === "editMessageText") {
//     return prev(method, { parse_mode: "HTML", ...payload }, signal);
//   }
//   return prev(method, payload, signal);
// });

// // Ответ на команду /start
// bot.command("start", start);

// bot.callbackQuery("menu", async (ctx) => {
//   await ctx.answerCallbackQuery();

//   // Удаляем старое сообщение и отправляем новое
//   try {
//     await ctx.deleteMessage();
//   } catch (e) {}

//   await ctx.reply(
//     "Привет! Я помогу тебе сдать экзамен на высокий балл! ✨\n\n" +
//       "Ссылка, которая всегда ведет на нас: <a href='https://t.me/+CkBHeS3mEW04Mzg6'>ЖМИ СЮДА</a>\n\n" +
//       "По любым вопросам: @enamoney",
//     {
//       reply_markup: new InlineKeyboard()
//         .text("Купить курсы", "buy")
//         .text("О нас", "info")
//         .text("Менеджер", "support"),
//     }
//   );
// });


// bot.callbackQuery("support", async (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   // Удаляем старое сообщение и отправляем новое
//   try {
//     await ctx.deleteMessage();
//   } catch (e) {}

//   await ctx.reply("Если у тебя есть проблемы с оплатой в боте, то можешь связаться с менеджером и оформить покупку 👉 @enamoney",
//     {
//       reply_markup: new InlineKeyboard()
//       .url("Основной канал", 'https://t.me/+CkBHeS3mEW04Mzg6')
//       .url("Отзывы", "https://t.me/+5inRad-nKMA3MzFi")
//       .text("Назад", "menu")
//     }
//   );
// });

// bot.callbackQuery("buy", async (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   // Удаляем старое сообщение и отправляем новое
//   try {
//     await ctx.deleteMessage();
//   } catch (e) {}

//   await ctx.reply("Выберете онлайн школу:",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Умскул", "umskul")
//       .text("100Бальный", "100ball").row()
//       .text("СмитАп", "smitAp")
//       .text("ЕГЭЛенд", "egeland").row()
//       .text("Назад", "menu").row()
//     }
//   );
// });

// ============ ВСТАВЬТЕ СВОИ ССЫЛКИ НА ФОТО ЗДЕСЬ ============

// Фото для разных страниц
// ============ ВСТАВЬТЕ СВОИ ССЫЛКИ НА ФОТО ЗДЕСЬ ============

// Фото для разных страниц
const PHOTOS = {
  // Главная страница с огненным персонажем (Image 1)
  mainMenu: "https://i.ibb.co/x8BNGzXB/photo-2025-11-04-23-42-35.jpg",
  
  // Страница выбора типа курса (Image 2)
  courseType: "https://i.ibb.co/x8BNGzXB/photo-2025-11-04-23-42-35.jpg",
  
  // Страница выбора предмета с огненным персонажем (Image 3)
  subjects: "https://i.ibb.co/x8BNGzXB/photo-2025-11-04-23-42-35.jpg",
  
  // Фото для каждого предмета (Image 4 - показана для русского)
  subjectPhotos: {
    russian: "ВСТАВЬТЕ_ССЫЛКУ_РУССКИЙ",
    math: "ВСТАВЬТЕ_ССЫЛКУ_МАТЕМАТИКА",
    chemistry: "ВСТАВЬТЕ_ССЫЛКУ_ХИМИЯ",
    english: "ВСТАВЬТЕ_ССЫЛКУ_АНГЛИЙСКИЙ",
    baseMath: "ВСТАВЬТЕ_ССЫЛКУ_БАЗОВАЯ_МАТЕМАТИКА",
    social: "ВСТАВЬТЕ_ССЫЛКУ_ОБЩЕСТВОЗНАНИЕ",
    biology: "ВСТАВЬТЕ_ССЫЛКУ_БИОЛОГИЯ",
    history: "ВСТАВЬТЕ_ССЫЛКУ_ИСТОРИЯ",
    physics: "ВСТАВЬТЕ_ССЫЛКУ_ФИЗИКА",
    informatics: "ВСТАВЬТЕ_ССЫЛКУ_ИНФОРМАТИКА",
    literature: "ВСТАВЬТЕ_ССЫЛКУ_ЛИТЕРАТУРА"
  },
  
  // Фото для страницы выбора месяца (Image 5)
  monthSelection: "https://i.ibb.co/x8BNGzXB/photo-2025-11-04-23-42-35.jpg",
  
  // Фото для страницы выбора тарифа (Image 6)
  tariffSelection: "https://i.ibb.co/x8BNGzXB/photo-2025-11-04-23-42-35.jpg",
  
  // Подробные фото для описания тарифов (Image 7-8)
  // Формат: {предмет}_{школа}_{месяц}_{тариф}
  tariffDetails: {
    // Пример: russian_umskul_september_standart
    // Добавьте свои ссылки для каждой комбинации
  }
};

// ============================================================

// Хранилище выбора пользователя
interface UserSelection {
  subject?: string;
  school?: string;
  month?: string;
}

const userSelections: { [userId: number]: UserSelection } = {};

// ============ КОМАНДА /START ============
bot.command("start", async (ctx) => {
  const welcomeText = 
    "Привет! Я помогу тебе сдать экзамен на высокий балл!\n\n" +
    "Ссылка, которая всегда ведет на нас👉 flamee.ru\n\n" +
    "По любым вопросам👉 @Flame54";

  const keyboard = new InlineKeyboard()
    .text("Купить курсы", "buy_courses")
    .text("О нас", "about_us").row()
    .text("👤 Менеджер", "manager");

  await ctx.reply(welcomeText, { 
    reply_markup: keyboard,
    parse_mode: "HTML"
  });
});

// ============ О НАС ============
bot.callbackQuery("about_us", async (ctx) => {
  await ctx.answerCallbackQuery();

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const aboutText = 
    "Привет! Мы работаем уже более 3-х лет, у нас есть много хороших отзывов! " +
    "Если у тебя возникает вопрос брать ли у нас курс\n\n" +
    "⚡ Ниже ты можешь увидеть ссылку на ОТЗЫВЫ и на наш основной канал, переходи и изучай информацию!\n" +
    "⚡ Конечно, важно понимать, что возврат осуществляется только в течение первых 3-х дней после покупки, " +
    "и только, если курс слит не полностью, иначе это будет не совсем честно!\n\n" +
    "Частые вопросы —> ЖМИ СЮДА";

  const keyboard = new InlineKeyboard()
    .url("🌸 Отзывы", "https://t.me/ваш_канал_отзывов")
    .url("📊 Основной канал", "https://t.me/ваш_основной_канал").row()
    .text("🔙 Назад", "back_to_start");

  await ctx.reply(aboutText, { reply_markup: keyboard });
});

// ============ МЕНЕДЖЕР ============
bot.callbackQuery("manager", async (ctx) => {
  await ctx.answerCallbackQuery();

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const managerText = 
    "Если у тебя есть проблемы с оплатой в боте, то можешь связаться с менеджером и оформить покупку 👉 @Flame54";

  const keyboard = new InlineKeyboard()
    .text("🌸 Отзывы", "reviews")
    .text("📊 Основной канал", "main_channel").row()
    .text("🔙 Назад", "back_to_start");

  await ctx.reply(managerText, { reply_markup: keyboard });
});

// ============ КНОПКА "НАЗАД" К СТАРТУ ============
bot.callbackQuery("back_to_start", async (ctx) => {
  await ctx.answerCallbackQuery();

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const welcomeText = 
    "Привет! Я помогу тебе сдать экзамен на высокий балл!\n\n" +
    "Ссылка, которая всегда ведет на нас👉 flamee.ru\n\n" +
    "По любым вопросам👉 @Flame54";

  const keyboard = new InlineKeyboard()
    .text("Купить курсы", "buy_courses")
    .text("О нас", "about_us").row()
    .text("👤 Менеджер", "manager");

  await ctx.reply(welcomeText, { 
    reply_markup: keyboard,
    parse_mode: "HTML"
  });
});

// ============ ОТЗЫВЫ И КАНАЛ (URL кнопки) ============
bot.callbackQuery("reviews", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "Открываю канал с отзывами...",
    show_alert: false
  });
  // URL будет открыт автоматически, если использовать .url() в клавиатуре
});

bot.callbackQuery("main_channel", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "Открываю основной канал...",
    show_alert: false
  });
});

// ============ ГЛАВНОЕ МЕНЮ ============
bot.callbackQuery("buy_courses", async (ctx) => {
  await ctx.answerCallbackQuery();

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const keyboard = new InlineKeyboard()
    .text("ЕГЭ / ОГЭ 2026", "select_exam_type");

  if (PHOTOS.mainMenu && !PHOTOS.mainMenu.includes("ВСТАВЬТЕ")) {
    await ctx.replyWithPhoto(PHOTOS.mainMenu, {
      caption: "Выберите:",
      reply_markup: keyboard
    });
  } else {
    await ctx.reply("Выберите:", { reply_markup: keyboard });
  }
});

// ============ ВЫБОР ТИПА КУРСА ============
bot.callbackQuery("select_exam_type", async (ctx) => {
  await ctx.answerCallbackQuery();

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const keyboard = new InlineKeyboard()
    .text("Годовые курсы", "yearly_courses")
    .text("Итоговое сочинение", "final_essay").row()
    .text("🔙 Назад", "menu");

  if (PHOTOS.courseType && !PHOTOS.courseType.includes("ВСТАВЬТЕ")) {
    await ctx.replyWithPhoto(PHOTOS.courseType, {
      reply_markup: keyboard
    });
  } else {
    await ctx.reply("Выберите тип курса:", { reply_markup: keyboard });
  }
});

// ============ ВЫБОР ПРЕДМЕТА ============
bot.callbackQuery("yearly_courses", async (ctx) => {
  await ctx.answerCallbackQuery();

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const keyboard = new InlineKeyboard()
    .text("Русский язык", "subject_russian")
    .text("Обществознание", "subject_social").row()
    .text("Математика", "subject_math")
    .text("Биология", "subject_biology").row()
    .text("Химия", "subject_chemistry")
    .text("История", "subject_history").row()
    .text("Английский язык", "subject_english")
    .text("Физика", "subject_physics").row()
    .text("Базовая математика", "subject_baseMath")
    .text("Информатика", "subject_informatics").row()
    .text("Литература", "subject_literature").row()
    .text("🔙 Назад", "select_exam_type");

  if (PHOTOS.subjects && !PHOTOS.subjects.includes("ВСТАВЬТЕ")) {
    await ctx.replyWithPhoto(PHOTOS.subjects, {
      reply_markup: keyboard
    });
  } else {
    await ctx.reply("Выберите предмет:", { reply_markup: keyboard });
  }
});

// ============ ВЫБОР ШКОЛЫ (для каждого предмета) ============
bot.callbackQuery(/^subject_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  
  const subject = ctx.match[1];
  const userId = ctx.from.id;
  
  if (!userSelections[userId]) {
    userSelections[userId] = {};
  }
  userSelections[userId].subject = subject;

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const keyboard = new InlineKeyboard()
    .text("100Б", "school_100b")
    .text("Умскул ЕГЭ", "school_umskul_ege").row()
    .text("ЕГЭЛэнд", "school_egeland")
    .text("Куплай", "school_kuplay").row()
    .text("🔙 Назад", "yearly_courses");

  const photoUrl = PHOTOS.subjectPhotos[subject as keyof typeof PHOTOS.subjectPhotos];

  if (photoUrl && !photoUrl.includes("ВСТАВЬТЕ")) {
    await ctx.replyWithPhoto(photoUrl, {
      reply_markup: keyboard
    });
  } else {
    await ctx.reply("Выберите школу:", { reply_markup: keyboard });
  }
});

// ============ ВЫБОР МЕСЯЦА ============
bot.callbackQuery(/^school_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  
  const school = ctx.match[1];
  const userId = ctx.from.id;
  
  if (!userSelections[userId]) {
    userSelections[userId] = {};
  }
  userSelections[userId].school = school;

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const keyboard = new InlineKeyboard()
    .text("Сентябрь", "month_september")
    .text("Октябрь", "month_october").row()
    .text("Ноябрь", "month_november")
    .text("Декабрь", "month_december").row()
    .text("Январь", "month_january")
    .text("Февраль", "month_february").row()
    .text("Март", "month_march")
    .text("Апрель", "month_april").row()
    .text("Май", "month_may")
    .text("Весь курс", "month_full_course").row()
    .text("🔙 Назад", `subject_${userSelections[userId].subject}`);

  if (PHOTOS.monthSelection && !PHOTOS.monthSelection.includes("ВСТАВЬТЕ")) {
    await ctx.replyWithPhoto(PHOTOS.monthSelection, {
      reply_markup: keyboard
    });
  } else {
    await ctx.reply("Выберите месяц:", { reply_markup: keyboard });
  }
});

// ============ ВЫБОР ТАРИФА ============
bot.callbackQuery(/^month_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  
  const month = ctx.match[1];
  const userId = ctx.from.id;
  
  if (!userSelections[userId]) {
    userSelections[userId] = {};
  }
  userSelections[userId].month = month;

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const keyboard = new InlineKeyboard()
    .text("Standart", "tariff_standart")
    .text("Premium", "tariff_premium").row()
    .text("🔙 Назад", `school_${userSelections[userId].school}`);

  if (PHOTOS.tariffSelection && !PHOTOS.tariffSelection.includes("ВСТАВЬТЕ")) {
    await ctx.replyWithPhoto(PHOTOS.tariffSelection, {
      reply_markup: keyboard
    });
  } else {
    await ctx.reply("Выберите тариф:", { reply_markup: keyboard });
  }
});

// ============ ОПИСАНИЕ ТАРИФА STANDART ============
bot.callbackQuery("tariff_standart", async (ctx) => {
  await ctx.answerCallbackQuery();
  
  const userId = ctx.from.id;
  const selection = userSelections[userId];

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  // Получаем цену в зависимости от месяца
  const isFullCourse = selection?.month === "full_course";
  const price = isFullCourse ? "800" : "800";

  const text = `Расписание на сентябрь
ЕГЭ по русскому языку с Александром Долгих

Стоимость: ${price} руб.

Standart:
В тариф входят:

Теоретические и практические онлайн-занятия.

Материалы для самостоятельной подготовки:
— Увлекательные домашки после каждого вебинара
— Пробные варианты ежемесячно
— Подробные конспекты и рабочие тетради к каждому дню курса
— Шпаргалки и интерактивные карточки, которые полностью повторяют структуру заданий`;

  const keyboard = new InlineKeyboard()
    .text("💳 Оплата картой любого банка(ЮМани)", "pay_standart").row()
    .text("✨ Активировать промокод", "activate_promo").row()
    .text("🔙 Назад", `month_${selection?.month}`);

  // Здесь можно добавить длинное фото с расписанием (Image 7)
  const detailPhotoKey = `${selection?.subject}_${selection?.school}_${selection?.month}_standart`;
  const detailPhoto = PHOTOS.tariffDetails[detailPhotoKey as keyof typeof PHOTOS.tariffDetails] as string | undefined;

  if (detailPhoto && detailPhoto.length > 10 && detailPhoto.startsWith("http")) {
    await ctx.replyWithPhoto(detailPhoto, {
      caption: text,
      reply_markup: keyboard
    });
  } else {
    await ctx.reply(text, { reply_markup: keyboard });
  }
});

// ============ ОПИСАНИЕ ТАРИФА PREMIUM ============
bot.callbackQuery("tariff_premium", async (ctx) => {
  await ctx.answerCallbackQuery();
  
  const userId = ctx.from.id;
  const selection = userSelections[userId];

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const isFullCourse = selection?.month === "full_course";
  const price = isFullCourse ? "890" : "890";

  const text = `Расписание на сентябрь
ЕГЭ по русскому языку с Александром Долгих

Оплата через ЮМани

При оплате внимательно проверяйте сумму, она должна совпадать с суммой в платежной системе.

После перевода, ожидайте автоматической выдачи ссылки на курс!

В случае если по истечению 10 минут после перевода, ссылка на курс не выдалась автоматически, отпишите менеджеру с чеком: https://t.me/f1ameet9

К оплате: ${price} руб.`;

  const keyboard = new InlineKeyboard()
    .text("💳 Купить", "buy_premium").row()
    .text("🔙 Назад", `month_${selection?.month}`);

  const detailPhotoKey = `${selection?.subject}_${selection?.school}_${selection?.month}_premium`;
  const detailPhoto = PHOTOS.tariffDetails[detailPhotoKey as keyof typeof PHOTOS.tariffDetails] as string | undefined;

  if (detailPhoto && detailPhoto.length > 10 && detailPhoto.startsWith("http")) {
    await ctx.replyWithPhoto(detailPhoto, {
      caption: text,
      reply_markup: keyboard
    });
  } else {
    await ctx.reply(text, { reply_markup: keyboard });
  }
});

// ============ ОБРАБОТЧИКИ ОПЛАТЫ ============
bot.callbackQuery("pay_standart", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("🔗 Перейдите по ссылке для оплаты: [ССЫЛКА НА ОПЛАТУ]");
});

bot.callbackQuery("buy_premium", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("🔗 Перейдите по ссылке для оплаты: [ССЫЛКА НА ОПЛАТУ]");
});

bot.callbackQuery("activate_promo", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("✨ Введите промокод:");
  // Здесь добавьте логику обработки промокода
});

// ============ ИТОГОВОЕ СОЧИНЕНИЕ ============
bot.callbackQuery("final_essay", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Раздел 'Итоговое сочинение' в разработке", {
    reply_markup: new InlineKeyboard().text("🔙 Назад", "select_exam_type")
  });
});








// bot.callbackQuery("menu", async (ctx) => {
//   await ctx.answerCallbackQuery();

//   await ctx.callbackQuery.message?.editText(
//     "Привет! Я помогу тебе сдать экзамен на высокий балл! ✨\n\n" +
//       "Ссылка, которая всегда ведет на нас: <a href='https://t.me/+CkBHeS3mEW04Mzg6'>ЖМИ СЮДА</a>\n\n" +
//       "По любым вопросам: @enamoney",
//     {
//       reply_markup: new InlineKeyboard()
//         .text("Купить курсы", "buy")
//         .text("О нас", "info")
//         .text("Менеджер", "support"),
//     }
//   );
// });


// bot.callbackQuery("support", (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   ctx.callbackQuery.message?.editText("Если у тебя есть проблемы с оплатой в боте, то можешь связаться с менеджером и оформить покупку 👉 @enamoney",
//     {
//       reply_markup: new InlineKeyboard()
//       .url("Основной канал", 'https://t.me/+CkBHeS3mEW04Mzg6')
//       .url("Отзывы", "https://t.me/+5inRad-nKMA3MzFi")
//       .text("Назад", "menu")
//     }
//   )
// })

// bot.callbackQuery("buy", (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   ctx.callbackQuery.message?.editText("Выберете онлайн школу:",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Умскул", "umskul")
//       .text("100Бальный", "100ball").row()
//       .text("СмитАп", "smitAp")
//       .text("ЕГЭЛенд", "egeland").row()
//       .text("Назад", "menu").row()
//     }
//   )
// })

// ============ ВСТАВЬТЕ СВОИ ССЫЛКИ НА ФОТО ЗДЕСЬ ============

// 1. Фото для первой страницы выбора предмета














































// bot.callbackQuery("umskul", (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   ctx.callbackQuery.message?.editText("Выбери предмет",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Русский", "rusum")
//       .text("Математика", "mathum").row()
//       .text("Xимия", "xim100")
//       .text("Английский язык", "engum").row()
//       .text("Базовая Математика", "basemathum")
//       .text("Обществознание", "obshum").row()
//       .text("Биология", "bioum")
//       .text("История", "histum").row()
//       .text("Физика", "fizum")
//       .text("Информатика", "infum").row()
//       .text("Литература", "litum").row()
//       .text("Назад", "buy")
//     }
//   )
// })

// bot.callbackQuery(/^(rusum|mathum|ximum|engum|basemathum|obshum|bioum|histum|fizum|infum|litum)$/,  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Выберите месяц или весь курс:",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Сентябрь", "sentum")
//       .text("Октябрь", "octum").row()
//       .text("Ноябрь", "novebum")
//       .text("Декабрь", "decum").row()
//       .text("Январь", "yanvarum")
//       .text("Февраль", "fevum").row()
//       .text("Март", "martum")
//       .text("Апрель", "aprum").row()
//       .text("Май", "mayum")
//       .text("Весь курс", "allum").row()
//       .text("Назад", "back_to_subjectsum")
//     }
//   )
// })

// bot.callbackQuery(/^(novebum|decum|yanvarum|fevum|martum|aprum|mayum)$/,  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Выберите тариф ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Standart", "standartum")
//       .text("Premium", "premiumum").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })

// bot.callbackQuery(/^(sentum)$/,  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Выберите тариф ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Standart", "standart_sent_um")
//       .text("Premium", "premium_sent_um").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })

// bot.callbackQuery("standart_sent_um",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Стоимость: 800 руб. \nStandart: \nГодовой курс — это твоя возможность подготовиться с нуля до максимальных баллов к ЕГЭ. \n\n — 8-12 онлайн-занятий в месяц с преподом курса \n — Записи всех онлайн-занятий \n— Дополнительные материалы (шпоры, конспекты и другое) \n\n— Пробники формата экзамена\n— Домашние задания после каждого урока  ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Оплата картой любого банка(Юмани)", "pay_standart").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })
// bot.callbackQuery("premium_sent_um",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Стоимость: 1200 руб. \nPremium: \n\n — 8-12 онлайн-занятий в месяц с преподом курса \n — Записи всех онлайн-занятий \n— Дополнительные материалы (шпоры, конспекты и другое) \n\n— Пробники формата экзамена\n— Домашние задания после каждого урока \n\n— Личный куратор, к которому можно обращаться по всем вопросам обучения\n— Проверка домашних работ с полноценной обратной связью ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Оплата картой любого банка(Юмани)", "pay_premium").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })

// bot.callbackQuery(/^(octum)$/,  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Выберите тариф ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Standart", "standart_oct_100")
//       .text("Premium", "premium_oct_100").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })

// bot.callbackQuery("standart_oct_um",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Стоимость: 800 руб. \nStandart: \nГодовой курс — это твоя возможность подготовиться с нуля до максимальных баллов к ЕГЭ. \n\n — 8-12 онлайн-занятий в месяц с преподом курса \n — Записи всех онлайн-занятий \n— Дополнительные материалы (шпоры, конспекты и другое) \n\n— Пробники формата экзамена\n— Домашние задания после каждого урока  ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Оплата картой любого банка(Юмани)", "pay_standart").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })
// bot.callbackQuery("premium_oct_um",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Стоимость: 1200 руб. \nPremium: \n\n — 8-12 онлайн-занятий в месяц с преподом курса \n — Записи всех онлайн-занятий \n— Дополнительные материалы (шпоры, конспекты и другое) \n\n— Пробники формата экзамена\n— Домашние задания после каждого урока \n\n— Личный куратор, к которому можно обращаться по всем вопросам обучения\n— Проверка домашних работ с полноценной обратной связью ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Оплата картой любого банка(Юмани)", "pay_premium").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })

// bot.callbackQuery("standartum",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Стоимость: 800 руб. \nStandart: \nГодовой курс — это твоя возможность подготовиться с нуля до максимальных баллов к ЕГЭ. \n\n — 8-12 онлайн-занятий в месяц с преподом курса \n — Записи всех онлайн-занятий \n— Дополнительные материалы (шпоры, конспекты и другое) \n\n— Пробники формата экзамена\n— Домашние задания после каждого урока  ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Оплата картой любого банка(Юмани)", "pay_standart").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })
// bot.callbackQuery("premiumum",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Стоимость: 1200 руб. \nPremium: \n\n — 8-12 онлайн-занятий в месяц с преподом курса \n — Записи всех онлайн-занятий \n— Дополнительные материалы (шпоры, конспекты и другое) \n\n— Пробники формата экзамена\n— Домашние задания после каждого урока \n\n— Личный куратор, к которому можно обращаться по всем вопросам обучения\n— Проверка домашних работ с полноценной обратной связью ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Оплата картой любого банка(Юмани)", "pay_premium").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })

// bot.callbackQuery("allum",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Выберите тариф ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Standart", "standart_yearum")
//       .text("Premium", "premium_yearum").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })

// bot.callbackQuery("standart_yearum",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Стоимость: 5500 руб. \nStandart: \nГодовой курс — это твоя возможность подготовиться с нуля до максимальных баллов к ЕГЭ. \n\n — 8-12 онлайн-занятий в месяц с преподом курса \n — Записи всех онлайн-занятий \n— Дополнительные материалы (шпоры, конспекты и другое) \n\n— Пробники формата экзамена\n— Домашние задания после каждого урока  ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Оплата картой любого банка(Юмани)", "pay_standart_year").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })
// bot.callbackQuery("premium_yearum",  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Стоимость: 7500 руб. \nStandart: \nГодовой курс — это твоя возможность подготовиться с нуля до максимальных баллов к ЕГЭ. \n\n — 8-12 онлайн-занятий в месяц с преподом курса \n — Записи всех онлайн-занятий \n— Дополнительные материалы (шпоры, конспекты и другое) \n\n— Пробники формата экзамена\n— Домашние задания после каждого урока  ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Оплата картой любого банка(Юмани)", "pay_premium_year").row()
//       .text("Назад", "back_to_dataum" )
//     }
//   )
// })


// bot.callbackQuery("back_to_subjectsum", async (ctx) => {
//   await ctx.answerCallbackQuery();
//   await ctx.editMessageText("Выбери предмет: Онлайн школа Сотка", {
//     reply_markup: new InlineKeyboard()
//       .text("Русский", "rusum")
//       .text("Математика", "mathum").row()
//       .text("химия", "ximum")
//       .text("Английский язык", "engum").row()
//       .text("Базовая Математика", "basemathum")
//       .text("Обществознание", "obshum").row()
//       .text("Биология", "bioum")
//       .text("История", "histum").row()
//       .text("Физика", "fizum")
//       .text("Информатика", "infum").row()
//       .text("Литература", "litum").row()
//       .text("Назад", "buy")
//   });
// });

// bot.callbackQuery("back_to_dataum", async (ctx) => {
//   await ctx.answerCallbackQuery();
//   await ctx.editMessageText("Выберете месяц или весь курс:", {
//     reply_markup: new InlineKeyboard()
//     .text("Сентябрь", "sentum")
//       .text("Октябрь", "octum").row()
//       .text("Ноябрь", "novebum")
//       .text("Декабрь", "decum").row()
//       .text("Январь", "yanvarum")
//       .text("Февраль", "fevum").row()
//       .text("Март", "martum")
//       .text("Апрель", "aprum").row()
//       .text("Май", "mayum")
//       .text("Весь курс", "allum").row()
//       .text("Назад", "buy")
//   });
// });












// bot.callbackQuery("egeland", (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   ctx.callbackQuery.message?.editText("Выбери предмет",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Русский", "rus")
//       .text("Математика", "math").row()
//       .text("Xимия", "xim")
//       .text("Английский язык", "eng").row()
//       .text("Базовая Математика", "basemath")
//       .text("Обществознание", "obsh").row()
//       .text("Биология", "bio")
//       .text("История", "hist").row()
//       .text("Физика", "fiz")
//       .text("Информатика", "inf").row()
//       .text("Литература", "lit").row()
//       .text("Назад", "buy")
//     }
//   )
// })

// bot.callbackQuery("100ball", (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   ctx.callbackQuery.message?.editText("Выберете предмет",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Русский", "rus")
//       .text("Математика", "math").row()
//       .text("Xимия", "xim")
//       .text("Английский язык", "eng").row()
//       .text("Базовая Математика", "basemath")
//       .text("Обществознание", "obsh").row()
//       .text("Биология", "bio")
//       .text("История", "hist").row()
//       .text("Физика", "fiz")
//       .text("Информатика", "inf").row()
//       .text("Литература", "lit").row()
//       .text("Назад", "buy")
//     }
//   )
// })


// bot.callbackQuery("umskul", (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   ctx.callbackQuery.message?.editText("Выберите предмет",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Русский", "rus")
//       .text("Математика", "math").row()
//       .text("Xимия", "xim")
//       .text("Английский язык", "eng").row()
//       .text("Базовая Математика", "basemath")
//       .text("Обществознание", "obsh").row()
//       .text("Биология", "bio")
//       .text("История", "hist").row()
//       .text("Физика", "fiz")
//       .text("Информатика", "inf").row()
//       .text("Литература", "lit").row()
//       .text("Назад", "buy")
//     }
//   )
// })

// bot.callbackQuery("smitAp", (ctx) => 
// {
//   ctx.answerCallbackQuery();

//   ctx.callbackQuery.message?.editText("Выберите предмет",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Русский", "rus")
//       .text("Математика", "math").row()
//       .text("Xимия", "xim")
//       .text("Английский язык", "eng").row()
//       .text("Базовая Математика", "basemath")
//       .text("Обществознание", "obsh").row()
//       .text("Биология", "bio")
//       .text("История", "hist").row()
//       .text("Физика", "fiz")
//       .text("Информатика", "inf").row()
//       .text("Литература", "lit").row()
//       .text("Назад", "buy")
//     }
//   )
// })

// bot.callbackQuery(/^(rus|math|xim|eng|basemath|obsh|bio|hist|fiz|inf|lit)$/,  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Выберите месяц или весь курс",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Сентябрь", "sent")
//       .text("Октябрь", "oct").row()
//       .text("Ноябрь", "noveb")
//       .text("Декабрь", "dec").row()
//       .text("Январь", "yanvar")
//       .text("Февраль", "fev").row()
//       .text("Март", "mart")
//       .text("Апрель", "apr").row()
//       .text("Май", "may")
//       .text("Весь курс", "all").row()
//       .text("Назад", "back_to_subjects")
//     }
//   )
// })

// bot.callbackQuery(/^(sent|oct|noveb|dec|yanvar|fev|mart|apr|may)$/,  (ctx) => 
// {
//    ctx.answerCallbackQuery();

//    ctx.callbackQuery.message?.editText("Выберите тариф ",
//     {
//       reply_markup: new InlineKeyboard()
//       .text("Standart", "standart")
//       .text("Premium", "premium").row()
//       .text("Назад", "back_to_data" )
//     }
//   )
// })



bot.callbackQuery(/^(pay_standart|pay_premium)$/,  (ctx) => 
{
   ctx.answerCallbackQuery();

   ctx.callbackQuery.message?.editText("Оплата через ЮМани \n\nПри оплате внимательно проверяйте сумму, она должна совпадать с суммой в платежной системе. \n\n После перевода, пришлите скриншот чека и напишите какой курс выбрали/месяц или весь курс/стандарт или премиум!\n\n Наш контакт: @ ",
    {
      reply_markup: new InlineKeyboard()
      .text("Купить", "buy_now").row()
      .text("Назад", "back_to_data" )
    }
  )
})

bot.callbackQuery("info", (ctx) => 
{
  ctx.answerCallbackQuery();

  ctx.callbackQuery.message?.editText("Привет! Мы работаем уже более  3-х лет, у нас есть много хороших отзывов! Если у тебя возникает вопрос брать ли у нас курс\n⚡️ Ниже ты можешь увидеть ссылку на ОТЗЫВЫ и на наш основной канал, переходи и изучай информацию!\n⚡️ Конечно, важно понимать, что возврат осуществляется только в течение первых 3-х дней после покупки, и только, если курс слит не полностью, иначе это будет не совсем честно)",
    {
      reply_markup: new InlineKeyboard()
      .url("Основной канал", 'https://t.me/+CkBHeS3mEW04Mzg6')
      .url("Отзывы", "https://t.me/+5inRad-nKMA3MzFi")
      .text("Назад", "menu")
    }
  )
})
 




// Обработка ошибок согласно документации
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

// Функция запуска бота
async function startBot() {
  const MONGODB_URL = process.env.MONGODB_URL;
  if (!MONGODB_URL) {
    throw new Error('MONGODB_URL is not defined');
  }
  try {
    await mongoose.connect(MONGODB_URL);
    bot.start();
    console.log('MongoDB connected & Bot started');
  } catch (error) {
    console.error('Error in startBot:', error);
  }
}

startBot();
