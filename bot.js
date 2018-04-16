const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

let PREFIX = botconfig.prefix;
let servers = {};

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
    var args1 = args.slice(1);

    switch (cmd.toLowerCase()){
        case "help":
            message.channel.send("Under Development!");
            break;
        case "admin":
            if (isAdmin(message.member)){
                message.channel.send("anda admin!");
            } else {
                message.channel.send("anda bukan admin!");
            }
            break;
        case 'play':
            play(message, args[1]);
            break;
        case 'skip':
            var server = servers[message.guild.id];
            if(server.dispatcher) server.dispatcher.end();
            break;
        case 'stop':
            var server = servers[message.guild.id];
            if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            break;
        default:
            message.channel.sendMessage("Command tidak ada");
    }
});

function play(msg, title){
  if(!title){
    msg.channel.sendMessage("Link belum ada");
    return;
  }
  if(!msg.member.voiceChannel){
    msg.channel.sendMessage("Harus masuk voice channel");
    return;
  }
  if(!servers[msg.guild.id]) servers[msg.guild.id] = {
    queue: []
  });

  var server = servers[msg.guild.id];

  server.queue.push(title);

  if (!msg.guild.voiceConnection) msg.member.voiceChannel.join().then(function(connection){
    play(connection, msg);
  };
}

function playcon(connection, message){
  var server = servers[message.guild.id];

  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

  server.queue.shift();

  server.dispatcher.on("end", function(){
    if (server.queue[0]) play(connection, message);
    else connection.disconnect();
  });
}

function isAdmin(member) {
  return member.hasPermission("ADMINISTRATOR");
}

client.login(process.env.BOT_TOKEN);
