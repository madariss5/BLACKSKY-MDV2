const { getMessage } = require('../lib/languages');

const { MessageType } = require('@adiwajshing/baileys').default;

let handler = async (m, { conn, text, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  function no(number){
    return number.replace(/\s/g, '').replace(/([@+-])/g, '');
  }
  
  if (!text) {
    return conn.reply(m.chat, `*『 G A G A L 』*\n\n${usedPrefix}unprem @tag/nomor|days\n\n*Example:* ${usedPrefix}unprem 6285764068784|99`, m);
  }

  text = no(text) + "@s.whatsapp.net";
  global.db.data.users[text].premium = false;
  global.db.data.users[text].premiumTime = 0;
  
  conn.reply(m.chat, `*Success menghapus akses premium untuk @${text.split('@')[0]}.*`, m, { contextInfo: { mentionedJid: [text] } });
};

handler.help = ['unprem'];
handler.tags = ['owner'];
handler.command = /^(unprem|delprem)$/i;
handler.owner = true;
handler.fail = null;

}

module.exports = handler;

// hapis skibidi