import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { MyContext } from "./types.js";
import {
  buildKey,
  catalog,
  displayNames,
  allowedSchoolsBySubject,
} from "./config/catalog.js";
import type { SubjectKey, SchoolKey, Tariff } from "./config/catalog.js";

// Bot init
const BOT_API_KEY = process.env.BOT_TOKEN;
if (!BOT_API_KEY) throw new Error("BOT_TOKEN is not defined");
const bot = new Bot<MyContext>(BOT_API_KEY);
bot.use(hydrate());

// Use a media-first flow so we can edit caption/media in place
const DEFAULT_BANNER_URL =
  "https://i.ibb.co/jkG6jfXb/photo-2025-11-04-23-42-35.jpg";

// School-specific banner images for the month selection screen
const SCHOOL_BANNERS: Record<string, string> = {
  umskul_ege: "https://i.ibb.co/8nz64QKp/photo-2025-11-02-23-57-38.jpg",
  "100b": "https://i.ibb.co/Wp5gv04p/photo-2025-11-03-01-19-26.jpg",
  kuplay: "https://i.ibb.co/5xYM14TV/photo-2025-11-03-01-31-06.jpg",
  egeland: "https://i.ibb.co/b58pNzpb/photo-2025-11-03-01-31-33.jpg",
};

// In-memory selection per user
type UserSelection = {
  subject?: string;
  school?: string;
  month?: string;
};
const userSelections: Record<number, UserSelection> = {};

// Helpers
function ensureUser(ctx: MyContext) {
  if (!ctx.from) {
    throw new Error("Отсутствуют данные пользователя (ctx.from)");
  }
  const id = ctx.from.id;
  if (!userSelections[id]) userSelections[id] = {};
  return userSelections[id];
}

async function safeEdit(
  ctx: MyContext,
  text: string,
  reply_markup?: InlineKeyboard
) {
  // Always prefer text-only updates so photos do not persist on menus
  try {
    await ctx.editMessageText(text, { reply_markup });
    return;
  } catch {}

  // If editing failed (e.g., current message is a photo), send new text and delete the old one
  const chatId = ctx.chat?.id;
  const oldMsgId = ctx.callbackQuery?.message?.message_id;
  await ctx.reply(text, { reply_markup });
  if (chatId && oldMsgId) {
    try {
      await ctx.api.deleteMessage(chatId, oldMsgId);
    } catch {}
  }
}

async function setMedia(
  ctx: MyContext,
  photoUrl: string,
  caption: string,
  reply_markup?: InlineKeyboard
) {
  const MAX_CAPTION = 1024;
  const safeCaption =
    caption.length > MAX_CAPTION ? caption.slice(0, MAX_CAPTION - 1) : caption;
  const chatId = ctx.chat?.id;
  const msgId = ctx.callbackQuery?.message?.message_id;
  if (chatId && msgId) {
    try {
      await ctx.api.editMessageMedia(
        chatId,
        msgId,
        { type: "photo", media: photoUrl, caption: safeCaption },
        { reply_markup }
      );
      return;
    } catch (e) {
      // Fallback below
    }
  }
  // If we know the old message, prefer sending a new photo and deleting the old one
  if (chatId && msgId) {
    const sent = await ctx.replyWithPhoto(photoUrl, {
      caption: safeCaption,
      reply_markup,
    });
    try {
      await ctx.api.deleteMessage(chatId, msgId);
    } catch {}
    return;
  }
  // Last resort: just send text and proceed
  await safeEdit(ctx, caption, reply_markup);
}

// /start
bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("Купить курсы", "buy_courses")
    .text("О нас", "about_us")
    .row()
    .text("Связаться с менеджером", "manager");

  await ctx.replyWithPhoto(DEFAULT_BANNER_URL, {
    caption:
      "Привет! Добро пожаловать в наш бот с курсами.\n\n" +
      "Готовы подобрать программу обучения? \n\n" +
      "По любым вопросам👉@BTC_none",
    reply_markup: keyboard,
  });
});

// Simple info screens
bot.callbackQuery("about_us", async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .url("Отзывы", "https://t.me/+5inRad-nKMA3MzFi")
    .url("Наш канал", "https://t.me/+CkBHeS3mEW04Mzg6")
    .row()
    .text("Назад", "back_to_start");
  await safeEdit(
    ctx,
    "Мы команда, которая помогает готовиться эффективно.",
    keyboard
  );
});

bot.callbackQuery("manager", async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .url("Написать менеджеру", "https://t.me/@BTC_none")
    .text("Назад", "back_to_start");
  await safeEdit(
    ctx,
    "Напишите менеджеру, чтобы получить консультацию.",
    keyboard
  );
});

bot.callbackQuery("back_to_start", async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .text("Купить курсы", "buy_courses")
    .text("О нас", "about_us")
    .row()
    .text("Связаться с менеджером", "manager");
  await setMedia(
    ctx,
    DEFAULT_BANNER_URL,
    "Вернулись в начало. Чем могу помочь?",
    keyboard
  );
});

// Payment instructions menu
bot.callbackQuery(/^pay_(standart|premium)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const sel = ensureUser(ctx);

  if (!sel?.subject || !sel?.school || !sel?.month) {
    await ctx.reply(
      "Комбинация не выбрана. Пожалуйста, начните заново (/start)."
    );
    return;
  }

  const tariff = ctx.match[1] as Tariff;
  const key = buildKey(
    sel.subject as any,
    sel.school as any,
    sel.month as any,
    tariff
  );
  const entry = catalog[key];

  const kb = new InlineKeyboard()
    .url("Написать менеджеру", "https://t.me/BTC_none")
    .row()
    .text("Назад", `tariff_${tariff}`);

  const instructions = [
    "Как оплатить:",
    "1) Реквезиты: 2204120103076796 (ЮMoney)",
    "2) После оплаты напишите менеджеру и укажите выбранный курс, предоставьте чек об оплате.",
    "3) Написать менеджеру: @BTC_none",
  ].join("\n");

  await safeEdit(ctx, instructions, kb);
});

// Main flow
bot.callbackQuery("buy_courses", async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard().text(
    "ЕГЭ / ОГЭ 2026",
    "select_exam_type"
  );
  await setMedia(ctx, DEFAULT_BANNER_URL, "Выберите направление:", keyboard);
});

bot.callbackQuery("select_exam_type", async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .text("Годовые курсы", "yearly_courses")
    .text("Итоговое сочинение", "final_essay")
    .row()
    .text("Назад", "back_to_start");
  await setMedia(ctx, DEFAULT_BANNER_URL, "Что выбираем?", keyboard);
});

bot.callbackQuery("yearly_courses", async (ctx) => {
  await ctx.answerCallbackQuery();
  const kb = new InlineKeyboard()
    .text("Русский", "subject_russian")
    .text("Обществознание", "subject_social")
    .row()
    .text("Математика", "subject_math")
    .text("Биология", "subject_biology")
    .row()
    .text("Химия", "subject_chemistry")
    .text("История", "subject_history")
    .row()
    .text("Английский язык", "subject_english")
    .text("Физика", "subject_physics")
    .row()
    .text("Базовая математика", "subject_baseMath")
    .text("Информатика", "subject_informatics")
    .row()
    .text("Литература", "subject_literature")
    .row()
    .text("Назад", "select_exam_type");
  await setMedia(ctx, DEFAULT_BANNER_URL, "Выберите предмет:", kb);
});

bot.callbackQuery(/^subject_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const subject = ctx.match[1] as SubjectKey;
  const user = ensureUser(ctx);
  user.subject = subject;

  const allowed: SchoolKey[] = allowedSchoolsBySubject[subject];
  let kb = new InlineKeyboard();
  for (let i = 0; i < allowed.length; i++) {
    const s: SchoolKey = allowed[i];
    const label = displayNames.schools[s];
    kb = kb.text(label, `school_${s}`);
    if (i % 2 === 1 && i !== allowed.length - 1) kb = kb.row();
  }
  kb = kb.row().text("Назад", "yearly_courses");
  await setMedia(ctx, DEFAULT_BANNER_URL, "Выберите онлайн-школу:", kb);
});

bot.callbackQuery(/^school_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const school = ctx.match[1];
  const user = ensureUser(ctx);
  user.school = school;

  const kb = new InlineKeyboard()
    .text("Сентябрь", "month_september")
    .text("Октябрь", "month_october")
    .row()
    .text("Ноябрь", "month_november")
    .text("Декабрь", "month_december")
    .row()
    .text("Январь", "month_january")
    .text("Февраль", "month_february")
    .row()
    .text("Март", "month_march")
    .text("Апрель", "month_april")
    .row()
    .text("Май", "month_may")
    .text("Весь курс", "month_full_course")
    .row()
    .text("Назад", `subject_${user.subject}`);
  const schoolPhoto = SCHOOL_BANNERS[school] || DEFAULT_BANNER_URL;
  await setMedia(ctx, schoolPhoto, "Выберите месяц или весь курс:", kb);
});

bot.callbackQuery(/^month_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const month = ctx.match[1];
  const user = ensureUser(ctx);
  user.month = month;

  const kb = new InlineKeyboard()
    .text("Standart", "tariff_standart")
    .text("Premium", "tariff_premium")
    .row()
    .text("Назад", `school_${user.school}`);
  await safeEdit(ctx, "Выберите тариф:", kb);
});

bot.callbackQuery("tariff_standart", async (ctx) => {
  await ctx.answerCallbackQuery();
  const sel = ensureUser(ctx);

  if (!sel?.subject || !sel?.school || !sel?.month) {
    await ctx.reply(
      "Комбинация не выбрана. Пожалуйста, начните заново (/start)."
    );
    return;
  }

  const key = buildKey(
    sel.subject as any,
    sel.school as any,
    sel.month as any,
    "standart"
  );
  const entry = catalog[key];

  const kb = new InlineKeyboard()
    .text("Оплатить", "pay_standart")
    .text("Активировать промокод", "activate_promo")
    .row()
    .text("Назад", `month_${sel.month}`);

  await setMedia(
    ctx,
    entry?.photoUrl || DEFAULT_BANNER_URL,
    entry?.text ?? "Информация недоступна.",
    kb
  );
});

bot.callbackQuery("tariff_premium", async (ctx) => {
  await ctx.answerCallbackQuery();
  const sel = ensureUser(ctx);

  if (!sel?.subject || !sel?.school || !sel?.month) {
    await ctx.reply(
      "Комбинация не выбрана. Пожалуйста, начните заново (/start)."
    );
    return;
  }

  const key = buildKey(
    sel.subject as any,
    sel.school as any,
    sel.month as any,
    "premium"
  );
  const entry = catalog[key];

  const kb = new InlineKeyboard()
    .text("Оплатить", "pay_premium")
    .row()
    .text("Назад", `month_${sel.month}`);

  await setMedia(
    ctx,
    entry?.photoUrl || DEFAULT_BANNER_URL,
    entry?.text ?? "Информация недоступна.",
    kb
  );
});

bot.callbackQuery("activate_promo", async (ctx) => {
  await ctx.answerCallbackQuery();
  await safeEdit(ctx, "Введите промокод одним сообщением.");
});

bot.callbackQuery("final_essay", async (ctx) => {
  await ctx.answerCallbackQuery();
  await safeEdit(
    ctx,
    "Итоговое сочинение: свяжитесь с менеджером для деталей.",
    new InlineKeyboard().text("Назад", "select_exam_type")
  );
});

// Global error handler
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Start polling
bot.start();
