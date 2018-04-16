const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', async () => {
    console.log('I am ready!');
 
    client.user.setPresence({ game: { name: '-help', type: 2 } });
});

client.on('message', async message => {  
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(!message.content.startsWith(botconfig.prefix)) return;
   
    var messageArray = message.content.substring(botconfig.prefix.length).split(" ");
    var cmd = messageArray[0]
    var args = messageArray.slice(1);
    
    if (message.member.roles.find("name", "ADMIN")) {
        switch (cmd.toLowerCase()){
            case "cekadmin":
                message.channel.send("anda admin!");
                break;
        }
    } else {
        switch (cmd.toLowerCase()){
            case "help":
                message.channel.send("Under Development!");
                break;
        }
    }
    
    
});

client.login(process.env.BOT_TOKEN);
