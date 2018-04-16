const botconfig = require("./botconfig.json");
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', async () => {
    console.log('I am ready!');
 
    client.user.setPresence({ game: { name: '=help', type: 2 } });
});

client.on('message', async message => {  
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    
    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    
    
    if (cmd === '${prefix}ping') {
    	return message.channel.send('PONG!');
  	}
    
    if (cmd === '${prefix}bing') {
    	return message.reply('BONG!');
  	}
    
    if (cmd === 'ping') {
    	return message.channel.send('PONG!');
  	}
    
});

client.login(process.env.BOT_TOKEN);
