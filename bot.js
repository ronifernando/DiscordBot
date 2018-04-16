const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = "=";

client.on('ready', async () => {
    console.log('I am ready!');
 
    client.user.setPresence({ game: { name: '=help', type: 2 } });
});

client.on('message', async message => {  
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    
    if(!message.content.subtring(prefix)) return;
    

    let messageArray = message.content.split(" ");
    let cmd = messageArray[0].substring(prefix.lenght);
    let args = messageArray.slice(1);
    
    
    if (cmd === 'ping') {
    	return message.channel.send('PONG!');
  	}
    
    if (cmd === 'bing') {
    	return message.reply('BONG!');
  	}
    
});

client.login(process.env.BOT_TOKEN);
