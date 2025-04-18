var fs = require('fs');
var path = require('path');
var fetch = require('node-fetch');
var handler = async (m, { conn, command, args }) => {
  if (!args[0]) return conn.reply(m.chat, 'Input URL!', m);
  if (args[0].match(/xnxx\.com|hamster\.com|nekopoi\.care/i)) {
    return conn.reply(m.chat, 'Link tersebut dilarang!', m);
  }
  await m.reply(getMessage('_', lang));
  var url = args[0].startsWith('http') ? args[0] : 'https://' + args[0]
  try {
    var img = await fetch(`https://api.betabotz.eu.org/fire/tools/ssweb?url=${url}&device=desktop&apikey=${lann}`);
    if (!img) {
      await m.reply(getMessage('failed_saat_percobaan_pertama_', lang));
      img = await fetch(`https://api.betabotz.eu.org/fire/tools/ssweb?url=${url}&device=desktop&apikey=${lann}`);
      if (!img) return conn.reply(m.chat, 'image not tersedia', m);
    }
    var filepath = path.join(__dirname, '../tmp/') + (+new Date) + '.jpeg'; // Ubah ke tmp folder
    if (!fs.existsSync(path.join(__dirname, '../tmp/'))) fs.mkdirSync(path.join(__dirname, '../tmp/'));
    const dest = fs.createWriteStream(filepath);
    dest.on('finish', () => {
    conn.sendFile(m.chat, filepath, 'screenshot.jpeg', 'Nih imagenya.', m)
        .then(() => {
        })
        .catch(() => { });
    });
    img.body.pipe(dest);    img.body.pipe(fs.createWriteStream(filepath));
  } catch (e) {
    console.log(e);
    conn.reply(m.chat, `Terjadi error!`, m);
  }
}
handler.help = ['ssweb','sspc'];
handler.tags = ['tools'];
handler.command = ['ssweb', 'sspc', 'ss',]

handler.limit = true;
handler.fail = null;

module.exports = handler;
