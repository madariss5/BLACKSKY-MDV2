const { getMessage } = require('../lib/languages');

const moment = require('moment-timezone');
const PhoneNum = require('awesome-phonenumber');

let regionNames = new Intl.DisplayNames(['en'], {
    type: 'region'
})

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command: cmd
}) => {
    let num = m.quoted?.sender || m.mentionedJid?.[0] || text
    if (!num) throw `Ex: ${usedPrefix + cmd} @tag / 628xxx`
    num = num.replace(/\D/g, '') + '@s.whatsapp.net'
    if (!(await conn.onWhatsApp(num))[0]?.exists) throw 'User not exists'
    let img = await conn.profilePictureUrl(num, 'image').catch(_ => 'https://telegra.ph/file/70e8de9b1879568954f09.jpg')
    let bio = await conn.fetchstatus(num).catch(_ => {})
    let name = await conn.getName(num)
    let business = await conn.getBusinessProfile(num)
    let format = PhoneNum(`+${num.split('@')[0]}`)
    let country = regionNames.of(format.getRegionCode('international'))
    let res = `\t\t\t\t*▾ WHATSAPP ▾*\n\n*° Country:* ${country.toUpperCase()}\n*° Name:* ${name ? name : '-'}\n*° Format Number:* ${format.getNumber('international')}\n*° URL:* wa.me/${num.split('@')[0]}\n*° Mention:* @${num.split('@')[0]}\n*° Status:* ${bio?.status || '-'}\n*° Status Date:* ${bio?.setAt ? moment(bio.setAt.toDateString()).locale('en').format('LL') : '-'}\n\n${business ? `\t\t\t\t*▾ BUSINESS INFO ▾*\n\n*° Business ID:* ${business.wid}\n*° Website:* ${business.website ? business.website : '-'}\n*° Email:* ${business.email ? business.email : '-'}\n*° Category:* ${business.category}\n*° Address:* ${business.address ? business.address : '-'}\n*° Timezone:* ${business.business_hours.timezone ? business.business_hours.timezone : '-'}\n*° Description:* ${business.description ? business.description : '-'}` : '*Standard WhatsApp Account*'}`
    img ? await conn.sendMessage(m.chat, {
        image: {
            url: img
        },
        caption: res,
        mentions: [num]
    }, {
        quoted: m
    }) : m.reply(res)
}

handler.help = ['wastalk']
handler.tags = ['tools']
handler.command = /^(wa|whatsapp)stalk$/i

module.exports = handler
