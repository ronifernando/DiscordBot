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

/**
 * Checks if a user is an admin.
 *
 * @param {GuildMember} member - The guild member
 * @returns {boolean} -
 */
function isAdmin(member) {
  return member.hasPermission("ADMINISTRATOR");
}

/**
 * Checks if the user can skip the song.
 *
 * @param {GuildMember} member - The guild member
 * @param {array} queue - The current queue
 * @returns {boolean} - If the user can skip
 */
function canSkip(member, queue) {
  if (ALLOW_ALL_SKIP) return true;
  else if (queue[0].requester === member.id) return true;
  else if (isAdmin(member)) return true;
  else return false;
}

/**
 * Gets the song queue of the server.
 *
 * @param {integer} server - The server id.
 * @returns {object} - The song queue.
 */
function getQueue(server) {
  // Check if global queues are enabled.
  if (GLOBAL) server = '_'; // Change to global queue.

  // Return the queue.
  if (!queues[server]) queues[server] = [];
  return queues[server];
}

/**
 * The command for adding a song to the queue.
 *
 * @param {Message} msg - Original message.
 * @param {string} suffix - Command suffix.
 * @returns {<promise>} - The response edit.
 */
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


function skip(msg, suffix) {
  // Get the voice connection.
  const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
  if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

  // Get the queue.
  const queue = getQueue(msg.guild.id);

  if (!canSkip(msg.member, queue)) return msg.channel.send(wrap('You cannot skip this as you didn\'t queue it.')).then((response) => {
    response.delete(5000);
  });

  // Get the number to skip.
  let toSkip = 1; // Default 1.
  if (!isNaN(suffix) && parseInt(suffix) > 0) {
    toSkip = parseInt(suffix);
  }
  toSkip = Math.min(toSkip, queue.length);

  // Skip.
  queue.splice(0, toSkip - 1);

  // Resume and stop playing.
  const dispatcher = voiceConnection.player.dispatcher;
  if (voiceConnection.paused) dispatcher.resume();
  dispatcher.end();

  msg.channel.send(wrap('Skipped ' + toSkip + '!'));
}

function queue(msg, suffix) {
  // Get the queue.
  const queue = getQueue(msg.guild.id);

  // Get the queue text.
  const text = queue.map((video, index) => (
    (index + 1) + ': ' + video.title
  )).join('\n');

  // Get the status of the queue.
  let queueStatus = 'Stopped';
  const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
  if (voiceConnection !== null) {
    const dispatcher = voiceConnection.player.dispatcher;
    queueStatus = dispatcher.paused ? 'Paused' : 'Playing';
  }

  // Send the queue and status.
  msg.channel.send(wrap('Queue (' + queueStatus + '):\n' + text));
}

function pause(msg, suffix) {
  // Get the voice connection.
  const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
  if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

  if (!isAdmin(msg.member))
    return msg.channel.send(wrap('You are not authorized to use this.'));

  // Pause.
  msg.channel.send(wrap('Playback paused.'));
  const dispatcher = voiceConnection.player.dispatcher;
  if (!dispatcher.paused) dispatcher.pause();
}

function leave(msg, suffix) {
  if (isAdmin(msg.member)) {
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) return msg.channel.send(wrap('I\'m not in any channel!.'));
    // Clear the queue.
    const queue = getQueue(msg.guild.id);
    queue.splice(0, queue.length);

    // End the stream and disconnect.
    voiceConnection.player.dispatcher.end();
    voiceConnection.disconnect();
  } else {
    msg.channel.send(wrap('You don\'t have permission to use that command!'));
  }
}

function clearqueue(msg, suffix) {
  if (isAdmin(msg.member)) {
    const queue = getQueue(msg.guild.id);

    queue.splice(0, queue.length);
    msg.channel.send(wrap('Queue cleared!'));
  } else {
    msg.channel.send(wrap('You don\'t have permission to use that command!'));
  }
}

function resume(msg, suffix) {
  // Get the voice connection.
  const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
  if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

  if (!isAdmin(msg.member))
    return msg.channel.send(wrap('You are not authorized to use this.'));

  // Resume.
  msg.channel.send(wrap('Playback resumed.'));
  const dispatcher = voiceConnection.player.dispatcher;
  if (dispatcher.paused) dispatcher.resume();
}

function volume(msg, suffix) {
  // Get the voice connection.
  const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
  if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

  if (!isAdmin(msg.member))
    return msg.channel.send(wrap('You are not authorized to use this.'));

  // Get the dispatcher
  const dispatcher = voiceConnection.player.dispatcher;

  if (suffix > 200 || suffix < 0) return msg.channel.send(wrap('Volume out of range!')).then((response) => {
    response.delete(5000);
  });

  msg.channel.send(wrap("Volume set to " + suffix));
  dispatcher.setVolume((suffix/100));
}

function executeQueue(msg, queue) {
  // If the queue is empty, finish.
  if (queue.length === 0) {
    msg.channel.send(wrap('Playback finished.'));

    // Leave the voice channel.
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection !== null) return voiceConnection.disconnect();
  }

  new Promise((resolve, reject) => {
    // Join the voice channel if not already in one.
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) {
      if (CHANNEL) {
        msg.guild.channels.find('name', CHANNEL).join().then(connection => {
          resolve(connection);
        }).catch((error) => {
          console.log(error);
        });

      // Check if the user is in a voice channel.
      } else if (msg.member.voiceChannel) {
        msg.member.voiceChannel.join().then(connection => {
          resolve(connection);
        }).catch((error) => {
          console.log(error);
        });
      } else {
        // Otherwise, clear the queue and do nothing.
        queue.splice(0, queue.length);
        reject();
      }
    } else {
      resolve(voiceConnection);
    }
  }).then(connection => {
    // Get the first item in the queue.
    const video = queue[0];

    console.log(video.webpage_url);

    // Play the video.
    msg.channel.send(wrap('Now Playing: ' + video.title)).then(() => {
      let dispatcher = connection.playStream(ytdl(video.webpage_url, {filter: 'audioonly'}), {seek: 0, volume: (DEFAULT_VOLUME/100)});

      connection.on('error', (error) => {
        // Skip to the next song.
        console.log(error);
        queue.shift();
        executeQueue(msg, queue);
      });

      dispatcher.on('error', (error) => {
        // Skip to the next song.
        console.log(error);
        queue.shift();
        executeQueue(msg, queue);
      });

      dispatcher.on('end', () => {
        // Wait a second.
        setTimeout(() => {
          if (queue.length > 0) {
            // Remove the song from the queue.
            queue.shift();
            // Play the next song in the queue.
            executeQueue(msg, queue);
          }
        }, 1000);
      });
    }).catch((error) => {
      console.log(error);
    });
  }).catch((error) => {
    console.log(error);
  });
}

function wrap(text) {
	return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
}

client.login(process.env.BOT_TOKEN);
