const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const yt = require('ytdl-core');

const client = new Discord.Client();

var queue = {};

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
            if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with ${tokens.prefix}add`);
            if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
            if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing');
            let dispatcher;
            queue[msg.guild.id].playing = true;

            console.log(queue);
            (function play(song) {
                console.log(song);
                if (song === undefined) return msg.channel.sendMessage('Queue is empty').then(() => {
                    queue[msg.guild.id].playing = false;
                    msg.member.voiceChannel.leave();
                });
                msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
                dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }));
                let collector = msg.channel.createCollector(m => m);
                collector.on('message', m => {
                    if (m.content.startsWith(tokens.prefix + 'pause')) {
                        msg.channel.sendMessage('paused').then(() => {dispatcher.pause();});
                    } else if (m.content.startsWith(tokens.prefix + 'resume')){
                        msg.channel.sendMessage('resumed').then(() => {dispatcher.resume();});
                    } else if (m.content.startsWith(tokens.prefix + 'skip')){
                        msg.channel.sendMessage('skipped').then(() => {dispatcher.end();});
                    } else if (m.content.startsWith('volume+')){
                        if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
                        dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
                        msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
                    } else if (m.content.startsWith('volume-')){
                        if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
                        dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
                        msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
                    } else if (m.content.startsWith(tokens.prefix + 'time')){
                        msg.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
                    }
                });
                dispatcher.on('end', () => {
                    collector.stop();
                    play(queue[msg.guild.id].songs.shift());
                });
                dispatcher.on('error', (err) => {
                    return msg.channel.sendMessage('error: ' + err).then(() => {
                        collector.stop();
                        play(queue[msg.guild.id].songs.shift());
                    });
                });
            })(queue[msg.guild.id].songs.shift());
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
