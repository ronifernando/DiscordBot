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
    
    if(!message.content.startsWith(prefix)) return;
    

    var messageArray = message.content.substring(prefix.length).split(" ");
    var cmd = messageArray[0]
    var args = messageArray.slice(1);
    
    switch (cmd.toLowerCase()){
        case "ping":
            message.channel.send('PONG!');
            break;
        case "help":
            message.channel.send('Under Development!');
            break;
    }
    
});

client.login(process.env.BOT_TOKEN);
