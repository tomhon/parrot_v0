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
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Bots Dialogs
//=========================================================


bot.dialog('/', [
    function (session) {
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title("Welcome to Parrot")
            .text("Your commentator - wherever soccer is played.")
            .images([
                 builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("Hi... I'm Parrot. I can help you track your soccer game.");
        session.beginDialog('/help');
    },
    function (session, results) {
        // Display menu
        session.beginDialog('/menu');
    },
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);

bot.dialog('/menu', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);


bot.dialog('/Match Details', [
    function (session) {
        session.send("Before the game gets underway, it would be great if you can give me some details of the game.");
        builder.Prompts.choice(session, "Who's playing? Which field? What's the schedule? What's the weather? Actions", ["Teams", "Location", "Schedule", "Weather", "Actions"]);
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.send('Calling' + results.response.entity);
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

// bot.dialog('/', [
//     function (session) {
//         session.send("Welcome to Parrot! Which game are you watching? Let me know when it kicks off.");
//         builder.Prompts.choice(session, "command?", ["Game Details", "Kick Off"]);
//     },
//     function (session, results) {
//         switch (results.response.entity) {
//             case "Game Details":
//                 session.replaceDialog("/gameDetails");
//                 break;
//             case "Kick Off":
//                 session.replaceDialog("/kickedOff");
//                 break;
//             default:
//                 session.replaceDialog("/");
//                 break;
//         }
//     }
// ]);



// bot.dialog('/cards', [
//     function (session) {
//         var msg = new builder.Message(session)
//             .textFormat(builder.TextFormat.xml)
//             .attachments([
//                 new builder.HeroCard(session)
//                     // .title("Hero Card")
//                     // .subtitle("Space Needle")
//                     .buttons([builder.CardAction.dialogAction(session, "weather", "Seattle, WA", "Current Weather")])
                    
//                     .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
//                     .images([
//                         builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
//                     ])
//                     .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
//             ]);
//         session.endDialog(msg);
//     }
// ]);

server.get('/', function (req, res) { 
    res.send('Parrot Bot is online'); 
    }); 



bot.dialog('/actions', [
    function (session) { 
        session.send("Bots can register global actions, like the 'help' & 'goodbye' actions, that can respond to user input at any time. You can even bind actions to buttons on a card.");

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
                    .buttons([
                        builder.CardAction.dialogAction(session, "weather", "Seattle, WA", "Current Weather")
                    ])
            ]);
        session.send(msg);

        session.endDialog("The 'Current Weather' button on the card above can be pressed at any time regardless of where the user is in the conversation with the bot. The bot can even show the weather after the conversation has ended.");
    }
]);

// Create a dialog and bind it to a global action

bot.dialog('/weather', [

    function (session, args) {

        session.endDialog("The weather in %s is 71 degrees and raining.", args.data);

    }

]);

bot.beginDialogAction('weather', '/weather');   // <-- no 'matches' option means this can only be triggered by a button.


bot.dialog('/signin', [ 
    function (session) { 
        // Send a signin 
        var msg = new builder.Message(session) 
            .attachments([ 
                new builder.SigninCard(session) 
                    .text("You must first signin to your account.") 
                    .button("signin", "http://example.com/") 
            ]); 
        session.endDialog(msg); 
    } 
]); 