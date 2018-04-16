const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

let PREFIX = botconfig.prefix;
let GLOBAL = false;
let MAX_QUEUE_SIZE = 20;
let DEFAULT_VOLUME = 50;
let ALLOW_ALL_SKIP = false;
let CLEAR_INVOKER = false;
let CHANNEL = false;

let queues = {};

client.on('ready', async () => {
    console.log('I am ready!');

    client.user.setPresence({ game: { name: '-help', type: 2 } });
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(!message.content.startsWith(botconfig.prefix)) return;

    const command = message.content.substring(PREFIX.length).split(/[ \n]/)[0].toLowerCase().trim();
    const suffix = message.content.substring(PREFIX.length + command.length).trim();
    var args = message.content.substring(PREFIX.length).split(" ");
    var cmd = args[0];
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
        case 'play':
            play(message, suffix);
            break;
        default:
            message.channel.sendMessage("Command tidak ada");
    }
});

function getQueue(server) {
  // Check if global queues are enabled.
  if (GLOBAL) server = '_'; // Change to global queue.

  // Return the queue.
  if (!queues[server]) queues[server] = [];
  return queues[server];
}

function play(msg, suffix) {
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
}

function wrap(text) {
	return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
}

client.login(process.env.BOT_TOKEN);
