const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
try {
  await m.reply(wait)
  let res = await fetch(`https://api.betabotz.eu.org/fire/muslim/tafsirsurah?text=adam&apikey=${lann}`);
  let json = await res.json()
  global.anu = [
       `―-TAFSIR-―\n\nSurah: ${json.result[0].surah}\n\nTafsir: ${json.result[0].tafsir}\n\nTipe: ${json.result[0].Type}\n\nSource: ${json.result[0].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[1].surah}\n\nTafsir: ${json.result[1].tafsir}\n\nTipe: ${json.result[1].Type}\n\nSource: ${json.result[1].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[2].surah}\n\nTafsir: ${json.result[2].tafsir}\n\nTipe: ${json.result[2].Type}\n\nSource: ${json.result[2].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[3].surah}\n\nTafsir: ${json.result[3].tafsir}\n\nTipe: ${json.result[3].Type}\n\nSource: ${json.result[3].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[4].surah}\n\nTafsir: ${json.result[4].tafsir}\n\nTipe: ${json.result[4].Type}\n\nSource: ${json.result[4].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[5].surah}\n\nTafsir: ${json.result[5].tafsir}\n\nTipe: ${json.result[5].Type}\n\nSource: ${json.result[5].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[6].surah}\n\nTafsir: ${json.result[6].tafsir}\n\nTipe: ${json.result[6].Type}\n\nSource: ${json.result[6].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[7].surah}\n\nTafsir: ${json.result[7].tafsir}\n\nTipe: ${json.result[7].Type}\n\nSource: ${json.result[7].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[8].surah}\n\nTafsir: ${json.result[8].tafsir}\n\nTipe: ${json.result[8].Type}\n\nSource: ${json.result[8].source}`, 
       `―-TAFSIR-―\n\nSurah: ${json.result[9].surah}\n\nTafsir: ${json.result[9].tafsir}\n\nTipe: ${json.result[9].Type}\n\nSource: ${json.result[9].source}`, 
    ]
conn.reply(m.chat,`${pickRandom(global.anu)}`);;
} catch (e) {
throw `Internal server eror!`
  }
}
  
    handler.help = ['tafsir']
    handler.tags = ['islamic']
    handler.command = /^(tafsir)$/i
    handler.group = true
    
    }

module.exports = handler

    function pickRandom(list) {
      return list[Math.floor(list.length * Math.random())]
    }
    



//danaputra133