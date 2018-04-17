const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const ms = require('ms');
const Music = require('discord.js-musicbot-addon');

const client = new Discord.Client();

let PREFIX = botconfig.prefix;

let interval = {};
let djlist = {};

client.on('ready', async () => {
    console.log('I am ready!');

    client.user.setPresence({ game: { name: '-help', type: 2 } });
});
client.on('message', async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;
  if(!message.content.startsWith(botconfig.prefix)) return;

  var args = message.content.substring(PREFIX.length).split(" ");
  var cmd = args[0];

  if(cmd.toLowerCase() === "play"){
    let gRole = message.guild.roles.find('name', "DJ ♫");
    if(!gRole) return message.reply("Role tidak ada");
    djcheck(message, djstat, gRole);
  }
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
            if(!interval[message.member.id]) interval[message.member.id]={
              status:[]
            };
            let itv = interval[message.member.id];
            if (itv.status[0]) {
              let now = new Date();
              let t = now - itv.status[0];
              let delay = 1 * 60 * 1000;
              if (t < delay){
                let td = delay - t;
                return message.channel.send('<@'+message.member.id+'>, Anda harus menunggu ' + timeConversion(td) + ' untuk bisa menggunakan command tersebut.');
              }else{
                itv.status.pop();
              }
            }

            let status = message.createdTimestamp;
            itv.status.push(status);

            let rMember = message.member;
            if(!rMember) return message.reply("User tidak ada");
            let gRole = message.guild.roles.find('name', "DJ ♫");
            if(!gRole) return message.reply("Role tidak ada");
            if (!isDJ(rMember, gRole)){
              console.log(args[1]);
              let mname = message.member.displayName;
              message.member.setNickname( mname.replace(new RegExp('♫', 'g'), '').replace(new RegExp('♪', 'g'), ''));
              if (args[1] == process.env.DJa){
                hk = 7;
              }
              if (args[1] == process.env.DJb){
                hk = 9;
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
              } else if (hk === 9){
                  let time='5m';
                  addroledj(message, rMember, time, gRole);
              } else {
                  message.channel.send("anda belum beruntung!");
              }
            } else {
              message.channel.send("anda sudah menjadi DJ!");
            }
            break;
        case "djcheck":
            let gRole = message.guild.roles.find('name', "DJ ♫");
            if(!gRole) return message.reply("Role tidak ada");
            djcheck(message, djstat, gRole);
            break;
    }
});

function djcheck(message, djstat, gRole){
  if(djlist[message.member.id].status[0]){
    let djstat = djlist[message.member.id];
    let now = new Date();
    let delay = now - djstat.status[0];;
    let djdelays = djstat.status[1]; * 24 * 60 * 60 * 1000;
    if(delay < djdelays){
      let tdelay = djdelays - delay
      message.channel.reply("role DJ anda akan berakhir setelah "+ timeConversion(tdelay));
    }else{
      djstat.status.pop();
      djstat.status.pop();
      message.channel.send('<@' + message.member.id + '>, Masa aktif role DJ anda telah berakhir.');
      let mname = message.member.displayName;
      message.member.setNickname( mname.replace(new RegExp('♫', 'g'), '').replace(new RegExp('♪', 'g'), ''));
      message.member.removeRole(gRole.id);
    }
  }else{
    message.channel.reply("anda Bukan DJ");
  }
}

function addroledj(message, rMember, time, gRole){
  if(!djstat[message.member.id]) djstat[message.member.id]={
    status: []
  }

  rMember.addRole(gRole.id);
  message.channel.send('selamat <@' + rMember.id + '>, anda mendapatkan role DJ selama '+ timeConversion(ms(time)) + '.');
  let mname = message.member.displayName;
  message.member.setNickname( mname.replace(new RegExp('♫', 'g'), '').replace(new RegExp('♪', 'g'), '') + "♫");

  let djstat = djlist[message.member.id];

  let status = message.createdTimestamp;
  djstat.status.push(status);
  djstat.status.push(ms(time));
}

function timeConversion(millisec) {
        var seconds = (millisec / 1000).toFixed(1);
        var minutes = (millisec / (1000 * 60)).toFixed(1);
        var hours = (millisec / (1000 * 60 * 60)).toFixed(0);
        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(0);

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
