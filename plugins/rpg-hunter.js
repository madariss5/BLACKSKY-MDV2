const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
  let monsters = [
    { area: 1, name: "Goblin" },
    { area: 1, name: "Slime" },
    { area: 1, name: "Wolf" },
    { area: 2, name: "Nymph" },
    { area: 2, name: "Skeleton" },
    { area: 2, name: "Wolf" },
    { area: 3, name: "Baby Demon" },
    { area: 3, name: "Ghost" },
    { area: 3, name: "Zombie" },
    { area: 4, name: "Imp" },
    { area: 4, name: "Witch" },
    { area: 4, name: "Zombie" },
    { area: 5, name: "Ghoul" },
    { area: 5, name: "Giant Scorpion" },
    { area: 5, name: "Unicorn" },
    { area: 6, name: "Baby Robot" },
    { area: 6, name: "Sorcerer" },
    { area: 6, name: "Unicorn" },
    { area: 7, name: "Cecaelia" },
    { area: 7, name: "Giant Piranha" },
    { area: 7, name: "Mermaid" },
    { area: 8, name: "Giant Crocodile" },
    { area: 8, name: "Nereid" },
    { area: 8, name: "Mermaid" },
    { area: 9, name: "Demon" },
    { area: 9, name: "Harpy" },
    { area: 9, name: "Killer Robot" },
    { area: 10, name: "Dullahan" },
    { area: 10, name: "Manticore" },
    { area: 10, name: "Killer Robot" },
    { area: 11, name: "Baby Dragon" },
    { area: 11, name: "Young Dragon" },
    { area: 11, name: "Scaled Baby Dragon" },
    { area: 12, name: "Kid Dragon" },
    { area: 12, name: "Not so young Dragon" },
    { area: 12, name: "Scaled Kid Dragon" },
    { area: 13, name: "Definitely not so young Dragon" },
    { area: 13, name: "Teen Dragon" },
    { area: 13, name: "Scaled Teen Dragon" },
  ]
  let player = global.db.data.users[m.sender]
  let sender = m.sender.split("@")[0]

//  let cdm = `${minutes(new Date - player.lasthunt)}`
//  let cds = `${seconds(new Date - player.lasthunt)}`
 // let cd1 = Math.ceil(01 - cdm)
  // let cd2 = Math.ceil(60 - cds)
 let __timers = (new Date - global.db.data.users[m.sender].lasthunt)
 let _timers = (1200000 - __timers) 
 let timers = clockString(_timers)

  let area_monsters = monsters[Math.floor(Math.random() * monsters.length)]
  let monster = area_monsters.name
  area_monsters = area_monsters.area
  let monsterName = monster.toUpperCase()

  if (new Date - global.db.data.users[m.sender].lasthunt > 1200000) {
  // if (global.db.data.users[m.sender].health > 99) {
//   if (global.db.data.users[m.sender].sword > 9) {
    let coins = parseInt(Math.floor(Math.random() * 100000))
    let exp = parseInt(Math.floor(Math.random() * 10000))
    let _healing = `${Math.floor(Math.random() * 100)}`.trim()
    let healing = (_healing * 1)
    
    /*let sum = 82 * player.area - 59
   let dmg = (player.sword  * 5 + player.armor * 5 - sum)
    dmg = dmg < 0 ? Math.abs(dmg) : 0*/

    player.health -= healing
    player.lasthunt = new Date * 1 // waktu hunt 2minutes

    if (player.health < 0) {
      let msg = `*@${sender}* Anda Mati Di Bunuh Oleh ${monsterName}`
      if (player.level > 0) {
      if (player.sword > 0) {
        player.level -= 1
        player.sword -= 5
        player.exp -= exp * 1
        msg += `\nLevel Anda Turun 1 Karena Mati Saat hunt!\nSword Anda Berlacking 5 Karena Mati Saat hunt!`
      }
      }
      player.health = 100
      conn.reply(m.chat, msg, m)
      return
    }

    player.money += coins * 1
    player.exp += exp * 1
    global.db.data.users[m.sender].ticketCoin += 1
    
    let message = `Success find *${monsterName}*
*@${sender}* Kamu already membunuhnya
Menable tokan:
${new Intl.NumberFormat('en-US').format(coins)} Money
${new Intl.NumberFormat('en-US').format(exp)} XP
Berlacking -${healing} Health, Tersisa ${player.health} Health

+1 Tiketcoin`
    conn.reply(m.chat, message, m)
//     } else m.reply(`Minimum sword mu 10 to be able to hunt monster`)
//     } else m.reply(`Minimum health mu 100 to be able to hunt monster`)
  } else return conn.reply(m.chat, `Wait *${timers}* Untuk hunt Lagi`, m)
}

handler.help = ['hunter']
handler.tags = ['rpg']
handler.command = /^hunter/i
handler.limit = true
handler.group = true
handler.rpg = true
handler.fail = null

module.exports = handler

/*function minutes(ms) {
  let m = isNaN(ms) ? '02' : Math.floor(ms / 1000) % 60
  return [m].map(v => v.toString().padStart(2, 0)).join(':')
}

function minutes(ms) {
  let s = isNaN(ms) ? '01' : Math.floor(ms / 1000) % 60
  return [s].map(v => v.toString().padStart(2, 0)).join(':')
}*/

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  console.log({ms,h,m,s})
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}