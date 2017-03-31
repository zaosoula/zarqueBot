exports.commands = {
    "hey": {
        name: "hey",
        description: "Returns **Yo**.",
        extendedhelp: "THE BOT SAY **Yo** !",
        usage: "",
        process: function(bot, msg, params) {
            msg.reply("**Yo**");
        }
    },
    "invite": {
        name: "invite",
        description: "Returns bot invite link.",
        extendedhelp: "Returns bot invite link.",
        usage: "",
        process: function(bot, msg, params) {
            msg.reply(config.invite);
        }
    },
    "list": {
        name: "list",
        description: "Return severs or users list knew by the bot.",
        extendedhelp: "Return severs or users list knew by the bot.",
        usage: "<servers|users>",
        process: function(bot, msg, params) {
            switch (params[0]) {
                case 'servers':
                case 'server':

                    bot.guilds.forEach(function(server) {
                        msg.channel.sendEmbed({
                            color: 3447003,
                            author: {
                                name: server.name,
                                icon_url: server.iconURL
                            },
                            fields: [{
                                    name: 'Members',
                                    value: server.memberCount - 1 // -1 for the bot
                                },
                                {
                                    name: 'Owner',
                                    value: "<@" + server.ownerID + ">"

                                }
                            ],
                            footer: {
                                icon_url: server.iconURL,
                            }
                        });
                    });

                    break;
                case 'users':
                case 'user':
                    msg.reply("Generating list of users...");
                    usersArray = []

                    bot.users.forEach(function(user) {
                        usersArray.push("<@" + user.id + "> - " + user.presence.status);
                    });
                    msg.channel.sendEmbed({
                        color: 3447003,
                        fields: [{
                            name: 'Users',
                            value: usersArray.join("\r\n")

                        }],
                    });

                    break;
                default:
                    msg.reply("list <servers|users>");

            }
        }
    },
    "clear": {
        name: "clear",
        description: "Clear data",
        extendedhelp: "Clear data",
        usage: "<all|{id}>",
        process: function(bot, msg, params) {
            switch (params[0]) {
                case 'all':
                    console.log(db.delete("/"));
                    break;
                default:
                    if (params[0] === null || params[0] === "null" || params[0].length > 0) {
                        db.delete("/" + params[0])
                        db.save();
                        msg.reply("Erase done");
                    } else {
                        msg.reply("User parameter *all* or an user id");
                    }
            }
        }
    },
    "stop": {
        name: "stop",
        description: "Stop the bot",
        extendedhelp: "Stop the bot",
        usage: "",
        process: function(bot, msg, params) {
            console.log('Recive stop command');
            users = db.getData("/");
            Object.keys(users).forEach(function(key) {
                db.delete("/" + key + "/waitEvent");
                console.log("- Stop : " + key);
            });
            console.log("Stopping...");
            process.exit();
        }
    },
}
