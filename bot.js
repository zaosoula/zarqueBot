var Discord = require("discord.js");
var ffmpeg = require("ffmpeg");
var bd = require('./dbManager');
var commands = require('./commands').commands;
global.config = require("./config.json")

var bot = new Discord.Client({
    autoReconnect: true
});


bot.on('ready', () => {
    console.log("Bot starting...");

    var connectedServ = 0;
    var connectedVocal = 0;
    var afkChannelID = bot.guilds.afkChannelID;

    console.log("- Bot connecting to vocal...");

    bot.guilds.forEach(function(server) {
        connectedServ++;
        var afkChannelID = server.afkChannelID;
        server.channels.forEach(function(channel) {
            if (channel.id === afkChannelID) {
                connectedVocal++;
                console.log("- - Bot voice connected to " + channel.name + " at " + server.name);
                channel.join().catch("ERROR : ", console.error);
            }
        });
    });

    console.log("- Bot connected to " + connectedServ + " servers and " + connectedVocal + " vocals channels");


    console.log("- Set bot game");
    bot.user.setGame("In dev");
    console.log("- Set bot status");
    bot.user.setStatus("online");
    console.log("Bot ready");
    console.log("\r\n\r\n\r\n");
    console.log("Waiting event...");
});

/*****************************************************
                                        MESSAGE
*****************************************************/
bot.on("message", message => {
    if (message.author == bot.user) {
        return;
    }
    if (message.author.id != bot.user.id) {
        if (message.author.equals(bot.user)) {
            return;
        }

        bd.save(message.author.id, 'message', {
            message: message
        });

        wait = bd.isWait(message.author.id, 'typingStop');
        if (wait.status === true) {
            bd.saveIn(message.author.id, "typingStart", wait.id, "message", bd.lastId(message.author.id, 'message'))
        }

        if (message.channel.type == 'dm') {

            var cmdTxt = message.content.split(" ")[0].toLowerCase();
            var params = message.content.substring(cmdTxt.length + 1); //add one for the space
            var params = params.split(" ");
            if (cmdTxt === "help") { // Help is special, as it isn't a real 'command'
                console.log("- - RECIVE COMMAND : " + cmdTxt);
                var messageArray = []; // Build a Messsage array, this makes all the messages send as one.
                var commandnames = []; // Build a array of names from commands.
                for (cmd in commands) {
                    var info = cmd;
                    var usage = commands[cmd].usage;
                    if (usage) {
                        info += " " + usage;
                    }
                    var description = commands[cmd].description;
                    if (description) {
                        info += "\n\t" + description;
                    }
                }
                if (!params[0]) {
                    messageArray.push("These are the currently avalible commands, use `help <command_name>` to learn more about a specific command.");
                    messageArray.push("");
                    for (index in commands) {
                        messageArray.push("**" + commands[index].name + "** " + commands[index].usage + "\n\t_" + commands[index].description + "_\n");
                    }
                    messageArray.push("");
                    messageArray.push("If you have any questions, or if you don't get something, contact <@93026825432756224>");
                    message.channel.sendMessage(messageArray);
                }
                if (params[0]) {

                    params.forEach(function(param) {
                        if (commands[param]) { // Look if suffix corresponds to a command
                            var commando = commands[param]; // Make a varialbe for easier calls
                            messageArray = []; // Build another message array
                            messageArray.push("**Command:** `" + commando.name + "`"); // Push the name of the command to the array
                            messageArray.push(""); // Leave a whiteline for readability
                            if (commando.hasOwnProperty("usage")) { // Push special message if command needs a suffix.
                                messageArray.push("**Usage:** `" + commando.name + " " + commando.usage + "`");
                            } else {
                                messageArray.push("**Usage:** `" + commando.name + "`");
                            }
                            messageArray.push("**Description:** " + commando.extendedhelp); // Push the extendedhelp to the array.
                            if (commando.hasOwnProperty("adminOnly")) { // Push special message if command is restricted.
                                messageArray.push("**This command is restricted to admins.**");
                            }
                            if (commando.hasOwnProperty("timeout")) { // Push special message if command has a cooldown
                                messageArray.push("**This command has a cooldown of " + commando.timeout + " seconds.**");
                            }
                            if (param == "meme") { // If command requested is meme, print avalible meme's
                                messageArray.push("");
                                var str = "**Currently available memes:\n**";
                                for (var m in meme) {
                                    str += m + ", ";
                                }
                                messageArray.push(str);
                            }
                            message.channel.sendMessage(messageArray); // Send the array to the user
                        } else {
                            message.channel.sendMessage("There is no **" + param + "** command!");
                        }
                    });

                }
            } else {
                var cmd = commands[cmdTxt];
                if (cmd) {
                    console.log("- - RECIVE COMMAND : " + cmdTxt);
                    cmd.process(bot, message, params);
                }
            }
        } else {
            bd.addStat(message.author.id, message.channel.guild.id, message.channel.id, 'message', 1);
            bd.addStat(message.author.id, 'total', 'total', 'lastSeen', Date.now(), true);
        }
    }


});

/*****************************************************
                                        MESSAGEUPDATE
*****************************************************/
bot.on("messageUpdate", (oldmessage, newmessage) => {
    //bot.emit('message',newmessage);
});

/*****************************************************
                                        USERUPDATE
*****************************************************/
bot.on("userUpdate", (oldUser, newUser) => {
    console.log("userUpdate", user.username);
});

/*****************************************************
                                        TYPINGSTART
*****************************************************/
bot.on("typingStart", (channel, user) => {

    bd.save(user.id, 'typingStart', {
        channel: channel,
        user: user
    });
    bd.wait(user.id, 'typingStop', bd.lastId(user.id, 'typingStart'))

    bd.addStat(user.id, 'total', 'total', 'lastSeen', Date.now(), true);

});

/*****************************************************
                                        TYPINGSTOP
*****************************************************/
bot.on("typingStop", (channel, user) => {

    bd.save(user.id, 'typingStop', {
        channel: channel,
        user: user
    });

    wait = bd.isWait(user.id, 'typingStop');
    if (wait.status === true) {
        bd.saveIn(user.id, "typingStart", wait.id, "typingStop", bd.lastId(user.id, 'typingStop'))
        bd.disableWait(user.id, 'typingStop')
    }

    bd.addStat(user.id, 'total', 'total', 'lastSeen', Date.now(), true);

});

/*****************************************************
                                        PRESENCEUPDATE
*****************************************************/
bot.on("presenceUpdate", (oldUser, newUser) => {
    bd.save(newUser.user.id, "presenceUpdate", {
        oldPresence: oldUser.frozenPresence,
        newPresence: newUser.user.presence,
        oldUser: oldUser,
        newUser: newUser
    })

    bd.addStat(newUser.author.id, 'total', 'total', 'lastSeen', Date.now(), true);

});

/*****************************************************

*****************************************************/
bot.on("guildMemberSpeaking", (user, speaking) => {
    if (user.speaking) {
        bd.save(user.user.id, 'speakingStart', {
            user: user
        });
        bd.wait(user.user.id, 'speakingStop', bd.lastId(user.user.id, 'speakingStart'))
    } else {
        bd.save(user.user.id, 'speakingStop', {
            user: user
        });
        wait = bd.isWait(user.user.id, 'speakingStop');
        if (wait.status === true) {
            bd.saveIn(user.user.id, "speakingStart", wait.id, "speakingStop", bd.lastId(user.user.id, 'speakingStop'))
            bd.disableWait(user.user.id, 'speakingStop')
        }
    }

    bd.addStat(user.user.id, 'total', 'total', 'lastSeen', Date.now(), true);
})


bot.login(config.token);
