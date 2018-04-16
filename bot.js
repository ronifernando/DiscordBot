const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const YTDL = require("ytdl-core");


function play(connection, message){
    var server = servers[message.guild.id];
    
    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
    
    server.queue.shift();
    
    server.dispatcher.on("end", function(){
        if(server.queue[0]) play(connection, message);
        else connection.disconnect();
    });
}
                                                   
const client = new Discord.Client();

var servers = {};

client.on('ready', async () => {
    console.log('I am ready!');
 
    client.user.setPresence({ game: { name: '-help', type: 2 } });
});

client.on('message', async message => {  
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(!message.content.startsWith(botconfig.prefix)) return;
   
    var args = message.content.substring(botconfig.prefix.length).split(" ");
    var cmd = args[0]
    var args1 = args.slice(1);
    
    switch (cmd.toLowerCase()){
        case "help":
            message.channel.send("Under Development!");
            break;
        case "admin":
            if (message.member.roles.find("name", "ADMIN")){
                message.channel.send("anda admin!");
            } else {
                message.channel.send("anda bukan admin!");
            }
            break;
        case "play":
            if(!args[1]){
                message.channel.sendMessage("Judul lagu belum ditambahkan");
                return;
            }
            if(!message.member.voiceChannel){
                message.channel.sendMessage("Masuk ke Voice Channel dulu");
                return;
            }
            if(!servers[message.guild.id]) server[message.guild.id] = {
                queue: []
            };            
            
            var server = servers[message.guils.id];
            
            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message);
            });
            break;
        case "skip":
            var server = servers[message.guild.id];
            if (server.dispatcher) server.dispatcher.end();
            break;
        case "stop":
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            break;
        default:
            message.channel.sendMessage("Command tidak ada");
    }    
});

client.login(process.env.BOT_TOKEN);
