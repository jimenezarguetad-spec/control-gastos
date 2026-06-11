const TelegramBot = require('node-telegram-bot-api');
const googleSheets = require('./google');
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;

if (token) {
    // Usamos polling para recibir mensajes en tiempo real
    const bot = new TelegramBot(token, { polling: true });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const texto = msg.text.trim();

        // Esperamos un formato "Categoria Monto" ej: "Comida 150"
        const partes = texto.split(' ');
        
        if (partes.length >= 2) {
            const monto = parseFloat(partes.pop()); // El último elemento es el número
            const categoria = partes.join(' '); // El resto es la categoría
            
            if (!isNaN(monto)) {
                const fecha = new Date().toISOString().split('T')[0];
                try {
                    await googleSheets.escribirDato([fecha, 'Gasto', categoria, 'Vía Telegram', monto]);
                    bot.sendMessage(chatId, `✅ Gasto registrado: ${categoria} por $${monto}`);
                } catch (error) {
                    bot.sendMessage(chatId, `❌ Error al guardar en la base de datos.`);
                }
            } else {
                bot.sendMessage(chatId, `⚠️ Formato incorrecto. Ejemplo válido: Comida 150`);
            }
        } else {
            bot.sendMessage(chatId, `Hola. Para registrar un gasto escribe: [Categoría] [Monto]. Ej: Pasajes 20`);
        }
    });
} else {
    console.log("No se configuró Telegram Bot");
}
