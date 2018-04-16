const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const yt = require('ytdl-core');
const music = require('discord.js-music-v11');

const client = new Discord.Client();

let queues = {};

client.on('ready', async () => {
    console.log('I am ready!');
 
    client.user.setPresence({ game: { name: '-help', type: 2 } });
});

music(client, {
	prefix: botconfig.prefix,   
	global: false,     
	maxQueueSize: 10, 
});

client.on('message', async msg => {  
    if(msg.author.bot) return;
    if(msg.channel.type === "dm") return;
    if(!msg.content.startsWith(botconfig.prefix)) return;
   
    var args = msg.content.substring(botconfig.prefix.length).split(" ");
    var cmd = args[0];
    var args1 = args.slice(1);
	
    switch (cmd.toLowerCase()){
        case "help":
            msg.channel.send("Under Development!");
            break;
        case "admin":
            if (msg.member.roles.find("name", "ADMIN")){
                msg.channel.send("anda admin!");
            } else {
                msg.channel.send("anda bukan admin!");
            }
            break;
        default:
            message.channel.sendMessage("Command tidak ada");
    }    
});
function getQueue(server) {
		if (GLOBAL) server = '_'; // Change to global queue.

		// Return the queue.
		if (!queues[server]) queues[server] = [];
		return queues[server];
}

client.login(process.env.BOT_TOKEN);
