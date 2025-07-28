const crypto = require('crypto');
const prisma = require('../utils/prisma');
const generateToken = require('../utils/generateToken'); // adjust path if needed

function checkTelegramAuth(data, botToken) {
  const { hash, ...fields } = data;
  const sortedKeys = Object.keys(fields).sort();
  const dataCheckString = sortedKeys.map(key => `${key}=${fields[key]}`).join('\n');

  const secret = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  return hmac === hash;
}

const telegramLogin = async (req, res) => {
  try {
    const { id, username, first_name } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const isValid = checkTelegramAuth(req.body, botToken);
    if (!isValid) return res.status(401).json({ message: "Invalid Telegram login" });

    let user = await prisma.user.findUnique({
      where: { telegramId: String(id) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: String(id),
          telegramUsername: username,
          name: first_name,
        },
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });

  } catch (err) {
    console.error("Telegram login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {telegramLogin};