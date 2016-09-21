var express = require('express');
// var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Ticker Setup
//=========================================================

function tickerEvent () {
    this.timestamp = "";
    this.event = "";
    this.player = "";
    this.details = "";
    this.user = "";
}

var ticker = new Array();

var oTickerEvent = new tickerEvent();
oTickerEvent.timestamp = "08:00";
oTickerEvent.user = "Tom";
ticker.push(oTickerEvent);



//=========================================================
// Web Server Setup
//=========================================================

// Setup Restify Server
var server = express();
// var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

server.set('views', __dirname + '/views');
server.use(require('./status'));
// server.set('view engine', 'ejs');


server.get('/', function (req, res) { 

    res.send('Parrot Bot is online'); 
    }); 

  
//=========================================================
// Bot Setup
//=========================================================

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

//=========================================================
// Main Menu Dialog
//=========================================================


bot.dialog('/menu', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Welcome to Parrot")
                    // .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    // .images([
                    //     builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    //         .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                    // ])
                    .buttons([
                        builder.CardAction.imBack(session, "login", "Login"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                        ]),
     
            ]);
        builder.Prompts.choice(session, msg, "login|matchDetails");

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
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits current function and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);

//=========================================================
// Top Level Dialogs
//=========================================================


bot.dialog('/matchProgress', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([

                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "goal|whistle|shot|matchDetails|overview|liveTicker|lineup|stats");

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

bot.dialog('/matchDetails', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Tell me about the match")

                    .buttons([
                        builder.CardAction.imBack(session, "homeTeam", "Home Team"),
                        builder.CardAction.imBack(session, "awayTeam", "Away Team"),
                        builder.CardAction.imBack(session, "location", "Location"),
                        builder.CardAction.imBack(session, "schedule", "Schedule"),
                        builder.CardAction.imBack(session, "weather", "Weather"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "homeTeam|awayTeam|location|schedule|weather|matchProgress|goal|whistle|shot|overview|liveTicker|lineup|stats");

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

bot.dialog('/goal', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Tell me about the goal")

                    .buttons([
                        builder.CardAction.imBack(session, "homeScorer", "Home Team Scorer"),
                        builder.CardAction.imBack(session, "homeAssist", "Home Team Assist"),
                        builder.CardAction.imBack(session, "awayScorer", "Away Team Scorer"),
                        builder.CardAction.imBack(session, "awayAssist", "Away Team Assist"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "homeTeam|awayTeam|location|schedule|weather|matchProgress|whistle|shot|matchDetails|overview|liveTicker|lineup|stats");

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

bot.dialog('/whistle', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Why was the whistle blown?")

                    .buttons([
                        builder.CardAction.imBack(session, "teams", "Teams"),
                        builder.CardAction.imBack(session, "location", "Location"),
                        builder.CardAction.imBack(session, "schedule", "Schedule"),
                        builder.CardAction.imBack(session, "weather", "Weather"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "teams|location|schedule|weather|matchProgress|goal|shot|matchDetails|overview|liveTicker|lineup|stats");

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

bot.dialog('/shot', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Tell me about the shot")

                    .buttons([
                        builder.CardAction.imBack(session, "teams", "Teams"),
                        builder.CardAction.imBack(session, "location", "Location"),
                        builder.CardAction.imBack(session, "schedule", "Schedule"),
                        builder.CardAction.imBack(session, "weather", "Weather"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "teams|location|schedule|weather|matchProgress|goal|whistle|matchDetails|overview|liveTicker|lineup|stats");

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


//=========================================================
// 2nd Level Dialogs - Match Details
//=========================================================

bot.dialog('/homeTeam', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Tell me about the Home Team")

                    .buttons([
                        builder.CardAction.imBack(session, "homeUniformColor", "Uniform Color"),
                        builder.CardAction.imBack(session, "homeName", "Name / Club"),
                        builder.CardAction.imBack(session, "homeGender", "Gender"),
                        builder.CardAction.imBack(session, "homeAge", "Age"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("Tell me about the match")

                    .buttons([
                        // builder.CardAction.imBack(session, "homeTeam", "Home Team"),
                        builder.CardAction.imBack(session, "awayTeam", "Away Team"),
                        builder.CardAction.imBack(session, "location", "Location"),
                        builder.CardAction.imBack(session, "schedule", "Schedule"),
                        builder.CardAction.imBack(session, "weather", "Weather")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "awayTeam|location|schedule|weather|goal|whistle|shot|matchDetails|overview|liveTicker|lineup|stats");

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

bot.dialog('/awayTeam', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Tell me about the Away Team")

                    .buttons([
                        builder.CardAction.imBack(session, "awayUniformColor", "Uniform Color"),
                        builder.CardAction.imBack(session, "awayName", "Name / Club"),
                        builder.CardAction.imBack(session, "awayGender", "Gender"),
                        builder.CardAction.imBack(session, "awayAge", "Age"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("Tell me about the match")

                    .buttons([
                        builder.CardAction.imBack(session, "homeTeam", "Home Team"),
                        builder.CardAction.imBack(session, "awayTeam", "Away Team"),
                        builder.CardAction.imBack(session, "location", "Location"),
                        builder.CardAction.imBack(session, "schedule", "Schedule"),
                        builder.CardAction.imBack(session, "weather", "Weather")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "select:100", "Overview"),
                        builder.CardAction.imBack(session, "select:100", "Live Ticker"),
                        builder.CardAction.imBack(session, "select:100", "Lineup"),
                        builder.CardAction.imBack(session, "select:100", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "teams|location|schedule|weather|matchProgress");

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

bot.dialog('/location', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Tell me about the Away Team")

                    .buttons([
                        builder.CardAction.imBack(session, "fieldName", "Field Name"),
                        builder.CardAction.imBack(session, "fieldNumber", "Field Number"),
                        builder.CardAction.imBack(session, "city", "City"),
                        builder.CardAction.imBack(session, "state", "State"),
                        builder.CardAction.imBack(session, "country", "Country"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("Tell me about the match")

                    .buttons([
                        builder.CardAction.imBack(session, "homeTeam", "Home Team"),
                        builder.CardAction.imBack(session, "awayTeam", "Away Team"),
                        builder.CardAction.imBack(session, "location", "Location"),
                        builder.CardAction.imBack(session, "schedule", "Schedule"),
                        builder.CardAction.imBack(session, "weather", "Weather")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "select:100", "Overview"),
                        builder.CardAction.imBack(session, "select:100", "Live Ticker"),
                        builder.CardAction.imBack(session, "select:100", "Lineup"),
                        builder.CardAction.imBack(session, "select:100", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "teams|location|schedule|weather|matchProgress");

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

bot.dialog('/schedule', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("What time does the game start?")

                    .buttons([
                        builder.CardAction.imBack(session, "startTime", "Kick Off Time"),
                        builder.CardAction.imBack(session, "timeZone", "Time Zone"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("Tell me about the match")

                    .buttons([
                        builder.CardAction.imBack(session, "homeTeam", "Home Team"),
                        builder.CardAction.imBack(session, "awayTeam", "Away Team"),
                        builder.CardAction.imBack(session, "location", "Location"),
                        builder.CardAction.imBack(session, "schedule", "Schedule"),
                        builder.CardAction.imBack(session, "weather", "Weather")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "select:100", "Overview"),
                        builder.CardAction.imBack(session, "select:100", "Live Ticker"),
                        builder.CardAction.imBack(session, "select:100", "Lineup"),
                        builder.CardAction.imBack(session, "select:100", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "teams|location|schedule|weather|matchProgress");

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

bot.dialog('/weather', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("What is the weather like?")

                    .buttons([
                        builder.CardAction.imBack(session, "weatherGeneral", "Sunny? Raining? Cloudy?"),
                        builder.CardAction.imBack(session, "visibility", "Visibility"),
                        builder.CardAction.imBack(session, "wind", "Wind"),
                        builder.CardAction.imBack(session, "temperature", "Temperature"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                new builder.HeroCard(session)
                    .title("Tell me about the match")

                    .buttons([
                        builder.CardAction.imBack(session, "homeTeam", "Home Team"),
                        builder.CardAction.imBack(session, "awayTeam", "Away Team"),
                        builder.CardAction.imBack(session, "location", "Location"),
                        builder.CardAction.imBack(session, "schedule", "Schedule"),
                        builder.CardAction.imBack(session, "weather", "Weather")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "select:100", "Overview"),
                        builder.CardAction.imBack(session, "select:100", "Live Ticker"),
                        builder.CardAction.imBack(session, "select:100", "Lineup"),
                        builder.CardAction.imBack(session, "select:100", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "teams|location|schedule|weather|matchProgress");

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

//=========================================================
// 2nd Level Dialogs - Goal
//=========================================================


bot.dialog('/homeScorer', [
    function (session) {
        session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
        // builder.Prompts.choice(session, "What's the latest score?, What's happened so far?, It's a Goal!, Someone took a shot, Ref blew the whistle, Here are the match details", 
        // ["Latest Score", "Ticker", "Goal", "Shot", "Whistle", "Match Details", "Actions"]);
                // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Which Home Team Player Scored?")

                    .buttons([
                        builder.CardAction.imBack(session, "homeScorer", "Home Team Scorer"),
                        builder.CardAction.imBack(session, "homeAssist", "Home Team Assist"),
                        builder.CardAction.imBack(session, "awayScorer", "Away Team Scorer"),
                        builder.CardAction.imBack(session, "awayAssist", "Away Team Assist"),
                        builder.CardAction.imBack(session, "matchProgress", "What's happening?")
                    ]),
                 new builder.HeroCard(session)
                    .title("Tell me about the goal")

                    .buttons([
                        // builder.CardAction.imBack(session, "homeScorer", "Home Team Scorer"),
                        builder.CardAction.imBack(session, "homeAssist", "Home Team Assist"),
                        builder.CardAction.imBack(session, "awayScorer", "Away Team Scorer"),
                        builder.CardAction.imBack(session, "awayAssist", "Away Team Assist"),
                        // builder.CardAction.imBack(session, "matchProgress", "Back")
                    ]),
                new builder.HeroCard(session)
                    .title("What's happening?")

                    .buttons([
                        builder.CardAction.imBack(session, "goal", "Goal"),
                        builder.CardAction.imBack(session, "whistle", "Whistle"),
                        builder.CardAction.imBack(session, "shot", "Shot"),
                        builder.CardAction.imBack(session, "matchDetails", "Match Details")
                    ]),
               new builder.HeroCard(session)
                    .title("<Home> <score> : <score> <Away>")

                    .buttons([
                        builder.CardAction.imBack(session, "select:100", "Overview"),
                        builder.CardAction.imBack(session, "select:100", "Live Ticker"),
                        builder.CardAction.imBack(session, "select:100", "Lineup"),
                        builder.CardAction.imBack(session, "select:100", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "teams|location|schedule|weather|matchProgress");

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

//=========================================================
// 2nd Level Dialogs - Goal
//=========================================================



//=========================================================
// 2nd Level Dialogs - Shot
//=========================================================




//=========================================================
// 2nd Level Dialogs - Whistle
//=========================================================



//=========================================================
// SignIn
//=========================================================


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

