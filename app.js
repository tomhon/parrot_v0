var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

// bot.dialog('/', function (session) {
//     session.send("Hello Parrot World");
// });

bot.dialog('/', [
    function (session) {
        session.send("You're in a large clearing. There's a path to the north.");
        builder.Prompts.choice(session, "command?", ["north", "look"]);
    },
    function (session, results) {
        switch (results.response.entity) {
            case "north":
                session.replaceDialog("/room1");
                break;
            default:
                session.replaceDialog("/");
                break;
        }
    }
]);
bot.dialog('/room1', [
    function (session) {
        session.send("There's a small house here surrounded by a white fence with a gate. There's a path to the south and west.");
        builder.Prompts.choice(session, "command?", ["open gate", "south", "west", "look"]);
    },
    function (session, results) {
        switch (results.response.entity) {
            case "open gate":
                session.replaceDialog("/room2");
                break;
            case "south":
                session.replaceDialog("/");
                break;
            case "west":
                session.replaceDialog("/room3");
                break;
            default:
                session.replaceDialog("/room1");
                break;
        }
    }
]);


server.get('/', function (req, res) { 
    res.send('Parrot Bot is online'); 
    }); 