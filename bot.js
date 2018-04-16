const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const Music = require('discord.js-musicbot-addon');

const client = new Discord.Client();

let PREFIX = botconfig.prefix;

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

    if(isDJ(message.member)){
      const music = new Music(client, {
        prefix: PREFIX,
        maxQueueSize: "100",
        disableLoop: true,
        youtubeKey: 'AIzaSyAMpPZdsqJxBySqctF0YDiFYaHnZClCuwg'
      });
    }else{
      message.channel.send("Mohon maaf command ini hanya untuk role DJ");
      break;
    }

    switch (cmd.toLowerCase()){
        case "help":
            message.channel.send("Under Development!\n=====================\nAlready implemented\n-Music Features");
            break;
        case "admin":
            if (isAdmin(message.member)){
                message.channel.send("anda admin!");
            } else {
                message.channel.send("anda bukan admin!");
            }
            break;
    }
});

function isAdmin(member) {
  return member.hasPermission("ADMINISTRATOR");
}

function isDJ(member) {
  return member.roles.find("name", "DJ");
}

client.login(process.env.BOT_TOKEN);
