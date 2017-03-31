var JsonDB = require('node-json-db');
global.db = new JsonDB("data", true, true);

exports.save = function(username, eventName, data) {
    console.log("EVENT : " + eventName + " - " + username);
    db.push("/" + username + "/event/" + eventName + "[]", {
        time: Date.now(),
        data: data
    }, true);
}

exports.saveIn = function(username, eventName, eventId, inEventName, inEventId) {
    db.push("/" + username + "/event/" + eventName + "[" + eventId + "]/event/" + inEventName, {
        id: inEventId,
    }, true);
}

exports.wait = function(username, eventName, waiterId) {
    db.push("/" + username + "/waitEvent/" + eventName, {
        status: true,
        id: waiterId
    })
}

exports.disableWait = function(username, eventName) {
    db.push("/" + username + "/waitEvent/" + eventName, {
        status: false
    })
}
exports.isWait = function(username, eventName) {
    try {
        return db.getData("/" + username + "/waitEvent/" + eventName);
    } catch (error) {
        return {
            "status": false
        };
    }
}

exports.lastId = function(username, eventName) {
    return db.getData("/" + username + "/event/" + eventName).length - 1;
}

exports.addStat = function(username, serverName, channelName, statName, number, overwrite=false) {
    try {
        lastValue = db.getData("/" + username + "/stat/" + serverName + "/" + channelName + "/" + statName + "/value");
    } catch (error) {
        lastValue = 0;
    }
    if(overwrite){
      db.push("/" + username + "/stat/" + serverName + "/" + channelName + "/" + statName + "/value", lastValue + number, true);
    }else{
      db.push("/" + username + "/stat/" + serverName + "/" + channelName + "/" + statName + "/value", number, true);

    }
    db.push("/" + username + "/stat/" + serverName + "/" + channelName + "/" + statName + "/lastUpdate", Date.now(), true);
}
