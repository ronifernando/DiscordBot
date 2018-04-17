const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const ms = require('ms');
const Music = require('discord.js-musicbot-addon');

const client = new Discord.Client();

let PREFIX = botconfig.prefix;

let interval = {};

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
            if(!interval[message.guild.id]) interval[message.guild.id]={
              status:[]
            };
            let itv = interval[message.guild.id];
            if (itv.status[0]) {
              let now = new Date();
              let t = now - itv.status.pop();
              let delay = 1 * 60 * 1000;
              if (t < delay){
                let td = delay - t;
                return message.channel.send('<@'+message.member.id+'>, Anda harus menunggu ' + timeConversion(td) + ' untuk bisa menggunakan command tersebut.');
              }
            }

            let status = message.createdTimestamp;
            itv.status.push(status);

            let rMember = message.member;
            if(!rMember) return message.reply("User tidak ada");
            let gRole = message.guild.roles.find('name', "DJ ♫");
            if(!gRole) return message.reply("Role tidak ada");
            if (!isDJ(rMember, gRole)){
              if (args[1] === 365951){
                hk = 7;
              }
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
  message.member.setNickname(message.member.nickname + " ♫");
  rMember.addRole(gRole.id);

  setTimeout(function(){
    rMember.removeRole(gRole.id);
    message.channel.send('<@' + rMember.id + '>, Masa aktir role DJ anda telah berakhir.');
  }, ms(time));
}

function timeConversion(millisec) {
        var seconds = (millisec / 1000).toFixed(1);
        var minutes = (millisec / (1000 * 60)).toFixed(1);
        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60) {
            return seconds + " detik";
        } else if (minutes < 60) {
            return minutes + " menit";
        } else if (hours < 24) {
            return hours + " jam";
        } else {
            return days + " hari"
        }
    }

function isAdmin(member) {
  return member.hasPermission("ADMINISTRATOR");
}

function isDJ(member, role) {
  return member.roles.has(role.id);
}

client.login(process.env.BOT_TOKEN);
