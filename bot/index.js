const path = require("path");
const dotenv = require("dotenv");
const { Telegraf } = require("telegraf");
const prisma = require("./prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// /start command
bot.start((ctx) => {
  ctx.reply("Welcome to MediBot! Use /link <code> to connect your account.");
});

// /link <code>
bot.command("link", async (ctx) => {
  const parts = ctx.message.text.split(" ");

  if (parts.length !== 2) {
    return ctx.reply("❌ Usage: /link <code>");
  }

  const code = parts[1];

  try {
    const linkRequest = await prisma.telegramLinkRequest.findUnique({
      where: { code },
    });

    if (!linkRequest) {
      return ctx.reply("❌ Invalid or expired code.");
    }

    // Link the Telegram ID to the user
    await prisma.user.update({
      where: { id: linkRequest.userId },
      data: { telegramId: String(ctx.from.id) },
    });

    // Delete the used link code
    await prisma.telegramLinkRequest.delete({
      where: { code },
    });

    ctx.reply("✅ Your Telegram account is now linked successfully!");
  } catch (err) {
    console.error("Error linking Telegram:", err);
    ctx.reply("❌ Something went wrong.");
  }
});
console.log("Starting bot...");
// Start bot
bot.launch().then(() => {
  console.log("🤖 Telegram bot started.");
});

module.exports = bot;