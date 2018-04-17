const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const ms = require('ms');
const Music = require('discord.js-musicbot-addon');

const client = new Discord.Client();

let PREFIX = botconfig.prefix;

client.on('ready', async () => {
    console.log('I am ready!');

    client.user.setPresence({ game: { name: '-help', type: 2 } });
});


const music = new Music(client, {
  prefix: PREFIX,
  maxQueueSize: "20",
  youtubeKey: 'AIzaSyAMpPZdsqJxBySqctF0YDiFYaHnZClCuwg'
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(!message.content.startsWith(botconfig.prefix)) return;

    var args = message.content.substring(PREFIX.length).split(" ");
    var cmd = args[0];
    var args1 = args.slice(1);
    var hk = Math.floor(Math.random() * 10);
    console.log(hk);

    switch (cmd.toLowerCase()){
        case "help":
            message.channel.send("Under Development!\n=====================\nAlready implemented\n-Music Features");
            break;
        case "admin":
            if (isAdmin(message.member)){
                message.channel.send("Anda admin!");
            } else {
                message.channel.send("Anda bukan admin!");
            }
            break;
        case "hoki":
            let rMember = message.member;
            if(!rMember) return message.reply("User tidak ada");
            let gRole = message.guild.roles.find('name', "DJ");
            if(!gRole) return message.reply("Role tidak ada");
            if (!isDJ(rMember, gRole)){
              if (hk === 7){
                  let time='4 days';
                  addroledj(message, rMember, time, gRole);
              } else if (hk === 1){
                  let time='2 days';
                  addroledj(message, rMember, time, gRole);
              } else if (hk === 5){
                  let time='1 days';
                  addroledj(message, rMember, time, gRole);
              } else if (hk === 0){
                  let time='3 days';
                  addroledj(message, rMember, time, gRole);
              } else {
                  message.channel.send("anda belum beruntung!");
              }
            } else {
              message.channel.send("anda sudah menjadi DJ!");
            }
            break;
    }
});

function addroledj(message, rMember, time, gRole){
  message.channel.send('selamat <@' + rMember.id + '>, anda mendapatkan role DJ selama '+ ms(ms(time), {long: true}) + '.');
  rMember.addRole(gRole.id);

  setTimeout(function(){
    rMember.removeRole(gRole.id);
    message.channel.send('<@' + rMember.id + '>, Masa aktir role DJ anda telah berakhir.');
  }, ms(time));
}

function isAdmin(member) {
  return member.hasPermission("ADMINISTRATOR");
}

function isDJ(member, role) {
  return member.roles.has(role.id);
}

client.login(process.env.BOT_TOKEN);
