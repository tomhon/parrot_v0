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
        session.send("Welcome to Parrot! Which game are you watching? Let me know when it kicks off.");
        builder.Prompts.choice(session, "command?", ["Game Details", "Kick Off"]);
    },
    function (session, results) {
        switch (results.response.entity) {
            case "Game Details":
                session.replaceDialog("/gameDetails");
                break;
            case "Kick Off":
                session.replaceDialog("/kickedOff");
                break;
            default:
                session.replaceDialog("/");
                break;
        }
    }
]);

bot.dialog('/gameDetails', [
    function (session) {
        session.send("Before the game gets underway, it would be great if you can give me some details of the game.");
        builder.Prompts.choice(session, "Who's playing? Which field? What's the schedule? What's the weather?", ["Teams", "Location", "Schedule", "Weather"]);
    },
    function (session, results) {
        switch (results.response.entity) {
            case "Teams":
                session.replaceDialog("/cards");
                break;
            case "Location":
                session.replaceDialog("/location");
                break;
            case "Schedule":
                session.replaceDialog("/schedule");
                break;
            case "Weather":
                session.replaceDialog("/weather");
                break;
            default:
                session.replaceDialog("/gameDetails");
                break;
        }
    }
]);

bot.dialog('/cards', [
    function (session) {
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
            ]);
        session.endDialog(msg);
    }
]);
server.get('/', function (req, res) { 
    res.send('Parrot Bot is online'); 
    }); 