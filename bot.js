const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const yt = require('ytdl-core');

const client = new Discord.Client();

let queues = {};

client.on('ready', async () => {
    console.log('I am ready!');
 
    client.user.setPresence({ game: { name: '-help', type: 2 } });
});

client.on('message', async msg => {  
    if(msg.author.bot) return;
    if(msg.channel.type === "dm") return;
    if(!msg.content.startsWith(botconfig.prefix)) return;
   
    var args = msg.content.substring(botconfig.prefix.length).split(" ");
    var cmd = args[0]
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
        case "play":
            // Make sure the user is in a voice channel.
            if (!CHANNEL && msg.member.voiceChannel === undefined) return msg.channel.send(wrap('You\'re not in a voice channel.'));

            // Make sure the suffix exists.
            if (!suffix) return msg.channel.send(wrap('No video specified!'));

            // Get the queue.
            const queue = getQueue(msg.guild.id);

            // Check if the queue has reached its maximum size.
            if (queue.length >= MAX_QUEUE_SIZE) {
                return msg.channel.send(wrap('Maximum queue size reached!'));
            }

            // Get the video information.
            msg.channel.send(wrap('Searching...')).then(response => {
                var searchstring = suffix
                if (!suffix.toLowerCase().startsWith('http')) {
                    searchstring = 'gvsearch1:' + suffix;
                }

                YoutubeDL.getInfo(searchstring, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
                    // Verify the info.
                    if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
                        return response.edit(wrap('Invalid video!'));
                    }

                    info.requester = msg.author.id;

                    // Queue the video.
                    response.edit(wrap('Queued: ' + info.title)).then(() => {
                        queue.push(info);
                        // Play if only one element in the queue.
                        if (queue.length === 1) executeQueue(msg, queue);
                    }).catch(console.log);
                });
            }).catch(console.log);
            break;
        case "skip":
            break;
        case "stop":
            break;
        default:
            message.channel.sendMessage("Command tidak ada");
    }    
});

client.login(process.env.BOT_TOKEN);
