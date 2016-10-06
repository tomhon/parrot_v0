var express = require('express');
var bodyParser = require('body-parser');
// var cache = require('memory-cache');
var router = express.Router();

var server = express();
var request = require('request');

var eventHubUrl = 'https://parrotrawevents.azurewebsites.net/api/HttpTriggerNodeJS1?code=n0rtoxjcoygj3v78iv7r885mi40dwr13vygz0wu74ftufcx47vihyflilseyuhj4oyw8jh71ra4i'


//=========================================================
// Web Server Setup
//=========================================================

// Setup Express Server


// server.use(bodyParser.urlencoded({ extended: true})); seems to be required to make status root work, but stops bot working
server.set('views', __dirname + '/views');
server.set('view engine', 'ejs');
server.use('/status', require('./status'));


server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});




server.get('/', function (req, res) { 
    res.send('Parrot Bot is online'); 
    }); 

//=========================================================
// Ticker Setup
//=========================================================

function player () {
    this.firstName = "";
    this.lastName = "";
    this.jerseyNumber = "";
    this.position = "";
    this.photo = null;
}

function tickerEvent () {
    this.timestamp = new Date();
    this.event = "";
    this.player = new player;
    this.details = "";
    this.user = "";
}

function team() {
    this.teamName = "";
    this.club = "";
    this.ageGroup = "";
    this.gender = "";
    this.uniform = "";
    this.coach = "";
    this.roster = new Array(); //array of player
    this.goals = new Array(); //array of goal
    this.shots = new Array(); // array of shot
    this.whistles = new Array(); //array of whistle
    }

function goal() {
    this.time = "",
    this.scorer = new player,
    this.assist = new player
}

function shot() {
    this.time = "",
    this.shooter = new player
}

function whistle() {
    this.time = "",
    this.whistleType = ""
}

function weather() {
    this.temperature = "",
    this.precipitation = "",
    this.visibility = ""
}

function schedule() {
    this.startTime = "09:00";
    this.timeZone = "PST";
}

function venue() {
    this.fieldName = "60 Acres";
    this.fieldNumber = 20;
    this.fieldCity = "Redmond";
    this.fieldState = "WA";
    this.fieldCountry = "USA";
}

function game() {
    this.id = "",
    this.mappingId = "",
    this.latestUpdateTime = new Date(),
    this.homeTeam = new team(),
    this.awayTeam = new team(),
    this.weather = new weather()
    this.schedule = new schedule();
    this.venue = new venue();
    this.events = new Array() //array of tickerEvent

}

//=========================================================
// Set up match data
//=========================================================

var localGame = new game();
localGame.homeTeam.club = "Home Team";
localGame.awayTeam.club = "Away Team";

//=========================================================
// Set up helper functions
//=========================================================

var eventHubUrl = 'https://parrotrawevents.azurewebsites.net/api/HttpTriggerNodeJS1?code=n0rtoxjcoygj3v78iv7r885mi40dwr13vygz0wu74ftufcx47vihyflilseyuhj4oyw8jh71ra4i'


var addToRawTicker = function (event, player, details) {
    var oTickerEvent = new tickerEvent();
    oTickerEvent.event = event;
    oTickerEvent.player = player;
    oTickerEvent.details = details;
    oTickerEvent.user = "Tom";
    // ticker.push(oTickerEvent);
    localGame.latestUpdateTime = new Date();
    localGame.mappingId = (localGame.mappingId + '1');
    localGame.events.push(oTickerEvent);

    request( eventHubUrl + '&game=' + JSON.stringify(localGame), function (error, response, body) {
        if (!error && response.statusCode == 200) {
        console.log('logged to Event Hub - response = ' + body) 
    }
    })
};

function whichHalf() {
    whichHalf.half = "First";
    ticker.forEach(function(tick) {
        if (tick.event == "kickoff_1stHalf" || tick.event == "finalWhistle_1stHalf") {
                console.log('2nd half');
                whichHalf.half = "Second";
                return whichHalf.half;
            }   
        });
    return whichHalf.half;
} 

//=========================================================
// Set up match data
//=========================================================

var localGame = new game();
localGame.homeTeam.club = "Home Team";
localGame.awayTeam.club = "Away Team";


//=========================================================
// Set up dummy data
//=========================================================

localGame.homeTeam.teamName = "G04 Schmetzer";
addToRawTicker("homeTeamEntered",'',localGame.homeTeam.teamName);
localGame.homeTeam.club = 'Crossfire';
addToRawTicker("homeClubEntered",'',localGame.homeTeam.club);
localGame.homeTeam.roster[7] = new player;
localGame.homeTeam.roster[7].firstName ="Poppy";
localGame.homeTeam.roster[7].lastName ="Honeybone";
localGame.homeTeam.roster[2] = new player;
localGame.homeTeam.roster[2].firstName ="Riley";
localGame.homeTeam.roster[2].lastName ="McQuade";


localGame.awayTeam.teamName = "G04 Copa";
addToRawTicker("awayTeamEntered",'',localGame.awayTeam.teamName);
localGame.awayTeam.club = 'Seattle United';
addToRawTicker("awayClubEntered",'',localGame.awayTeam.club);
localGame.awayTeam.roster[3] = new player;
localGame.awayTeam.roster[3].firstName ="Andi";
localGame.awayTeam.roster[3].lastName ="Miller";
localGame.awayTeam.roster[2] = new player;
localGame.awayTeam.roster[2].firstName ="Anna";
localGame.awayTeam.roster[2].lastName ="Menti";
  
//=========================================================
// Bot Setup
//=========================================================

var builder = require('botbuilder');
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));


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
            .title("Parrot - your commentary - wherever soccer is played")
            .images([
                //  builder.CardImage.create(session, "")
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
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                 new builder.HeroCard(session)
                    .title("Welcome to Parrot")

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
        session.send('returned to menu dialog');
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits current function and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);

//=========================================================
// Top Level Dialogs - Overview
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club,localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

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
        session.send('<returned to matchProgress dialog>');
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

//=========================================================
// 2nd Level Dialogs - What's Happening
//=========================================================

bot.dialog('/goal', [
    function (session) {
        //log time of goal
        addToRawTicker("Goal");

        // session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
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
                        builder.CardAction.imBack(session, "homeScored",localGame.homeTeam.club + " Goal"),
                        builder.CardAction.imBack(session, "awayScored",localGame.awayTeam.club + " Goal"),
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club, localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "homeScored|awayScored|matchProgress|whistle|shot|matchDetails|overview|liveTicker|lineup|stats");

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
        session.send("<returned to goal dialog>");
        session.replaceDialog('/goal');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/whistle', [
    function (session) {
        //log time of whistle
        addToRawTicker("Whistle");

        // session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
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
                        builder.CardAction.imBack(session, "kickOff", "Kick Off"),
                        builder.CardAction.imBack(session, "goalKick", "Goal Kick"),
                        builder.CardAction.imBack(session, "throwIn", "Throw In"),
                        builder.CardAction.imBack(session, "foul", "Foul"),
                        builder.CardAction.imBack(session, "corner", "Corner"),
                        builder.CardAction.imBack(session, "offside", "Offside"),
                        builder.CardAction.imBack(session, "substitution", "Substitution"),
                        builder.CardAction.imBack(session, "penalty", "Penalty"),
                        builder.CardAction.imBack(session, "finalWhistle", "Half Time / Full Time"),                        
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club,localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "kickOff|foul|goalKick|corner|offside|penalty|substitution|finalWhistle|throwIn|matchProgress|goal|shot|matchDetails|overview|liveTicker|lineup|stats");

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
        session.send("<returned to whistle dialog>");        
        session.replaceDialog('/whistle');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/shot', [
    function (session) {
        //log time of goal
        addToRawTicker("Shot");

        // session.send("Let me know what's going on in the game and I can give you a summary anytime you need it.");
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
                        builder.CardAction.imBack(session, "homeShot",localGame.homeTeam.club + " Shot"),
                        builder.CardAction.imBack(session, "awayShot",localGame.awayTeam.club + " Shot"),
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club,localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

                    .buttons([
                        builder.CardAction.imBack(session, "overview", "Overview"),
                        builder.CardAction.imBack(session, "liveTicker", "Live Ticker"),
                        builder.CardAction.imBack(session, "lineup", "Lineup"),
                        builder.CardAction.imBack(session, "stats", "Stats")
                    ])
     
            ]);
        builder.Prompts.choice(session, msg, "homeShot|awayShot|matchProgress|goal|whistle|matchDetails|overview|liveTicker|lineup|stats");

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
        session.send("<returned to shot dialog>");
        session.replaceDialog('/shot');
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
                        // builder.CardAction.imBack(session, "location", "Location"),
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club,localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

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
        session.send("<returned to matchDetails dialog>");
        session.replaceDialog('/matchDetails');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

//=========================================================
// 2nd Level Dialogs - Overview
//=========================================================

bot.dialog('/overview', [
    function (session) {
        session.send("Current Ticker");
        localGame.events.forEach(function(tick) {
            session.send( tick.event + " " + tick.player + " " + tick.details + " " + tick.user + " " + tick.timestamp.toUTCString().slice(16,29) );
            // session.send(tick.user);
        });
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club,localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

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

bot.dialog('/liveTicker', [
    function (session) {
        session.send("Current Ticker");
        localGame.events.forEach(function(tick) {
            session.send( tick.event + " " + tick.player + " " + tick.details + " " + tick.user + " " + tick.timestamp.toUTCString().slice(16,29) );
            // session.send(tick.user);
        });
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club,localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

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

bot.dialog('/lineup', [
    function (session) {
        session.send("Current Ticker");
        localGame.events.forEach(function(tick) {
            session.send( tick.event + " " + tick.player + " " + tick.details + " " + tick.user + " " + tick.timestamp.toUTCString().slice(16,29) );
            // session.send(tick.user);
        });
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club,localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

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

bot.dialog('/stats', [
    function (session) {
        session.send("Current Ticker");
        localGame.events.forEach(function(tick) {
            session.send( tick.event + " " + tick.player + " " + tick.details + " " + tick.user + " " + tick.timestamp.toUTCString().slice(16,29) );
            // session.send(tick.user);
        });
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
                    .title( "%s %s : %s %s",localGame.homeTeam.club,localGame.homeTeam.goals.length,localGame.awayTeam.goals.length,localGame.awayTeam.club)

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


//=========================================================
// 3rd Level Dialogs - Match Details
//=========================================================

bot.dialog('/homeTeam', [
    function (session) {
        session.send("Home club name is currently set to " +localGame.homeTeam.club);
        builder.Prompts.text(session, "If you want to change it, please enter a new club name");

    },
    function (session, results) {

        if (results.response) {
                localGame.homeTeam.club = results.response;
                addToRawTicker("homeClubEntered", "", localGame.homeTeam.club);
                session.send("Home club is now %s", localGame.homeTeam.club);  
        } else {
            next();

        }
        session.send("Home team name is currently set to " + localGame.homeTeam.teamName);
        builder.Prompts.text(session, "If you want to change it, please enter a new team name");

    },
    function (session, results) {
        if (results.response) {
                localGame.homeTeam.teamName = results.response;
                addToRawTicker("homeNameEntered", "", localGame.homeTeam.teamName);
                session.send("Home team is now %s", localGame.homeTeam.teamName);    
  
        } else {
            next();

        }
        session.send("Home age group name is currently set to " + localGame.homeTeam.ageGroup);
        builder.Prompts.text(session, "If you want to change it, please enter a new age group");

    },
    function (session, results) {

        if (results.response) {
                localGame.homeTeam.ageGroup = results.response;
                addToRawTicker("homeAgeEntered", "", localGame.homeTeam.ageGroup);
                session.send("Home age group is now %s", localGame.homeTeam.ageGroup);  
        } else {
            next();

        }
        session.send("Home gender is currently set to " + localGame.homeTeam.gender);
        builder.Prompts.choice(session, "If you want to change it, please enter ", "Girls|Boys");

    },
    function (session, results) {
        if (results.response) {
                localGame.homeTeam.gender = results.response.entity;
                addToRawTicker("homeGenerEntered", "", localGame.homeTeam.gender);
                session.send("Home gender is now %s", localGame.homeTeam.gender);    
  
        } else {
            next();

        }
        session.send("Home uniform is currently set to " + localGame.homeTeam.uniform);
        builder.Prompts.text(session, "If you want to change it, please enter a new uniform color");

    },
    function (session, results) {

        if (results.response) {
                localGame.homeTeam.uniform = results.response;
                addToRawTicker("homeUniformEntered", "", localGame.homeTeam.uniform);
                session.send("Home Uniform is now %s", localGame.homeTeam.uniform);  
        } else {
            next();

        }
        
        session.endDialog();

    }
]);

bot.dialog('/awayTeam', [
    function (session) {
        session.send("Away club name is currently set to " + localGame.awayTeam.club);
        builder.Prompts.text(session, "If you want to change it, please enter a new club name");

    },
    function (session, results) {

        if (results.response) {
                localGame.awayTeam.club = results.response;
                addToRawTicker("awayClubEntered", "", localGame.awayTeam.club);
                session.send("Away club is now %s", localGame.awayTeam.club);  
        } else {
            next();

        }
        session.send("Away team name is currently set to " + localGame.awayTeam.teamName);
        builder.Prompts.text(session, "If you want to change it, please enter a new team name");

    },
    function (session, results) {
        if (results.response) {
                localGame.awayTeam.teamName = results.response;
                addToRawTicker("awayNameEntered", "", localGame.awayTeam.teamName);
                session.send("Away team is now %s", localGame.awayTeam.teamName);    
  
        } else {
            next();

        }
        session.send("Away age group name is currently set to " + localGame.awayTeam.ageGroup);
        builder.Prompts.text(session, "If you want to change it, please enter a new age group");

    },
    function (session, results) {

        if (results.response) {
                localGame.awayTeam.ageGroup = results.response;
                addToRawTicker("awayAgeEntered", "", localGame.awayTeam.ageGroup);
                session.send("Away age group is now %s", localGame.awayTeam.ageGroup);  
        } else {
            next();

        }
        session.send("Away gender is currently set to " + localGame.awayTeam.gender);
        builder.Prompts.choice(session, "If you want to change it, please enter ", "Girls|Boys");

    },
    function (session, results) {
        if (results.response) {
                localGame.awayTeam.gender = results.response.entity;
                addToRawTicker("awayGenderEntered", "", localGame.awayTeam.gender);
                session.send("Away gender is now %s", localGame.awayTeam.gender);    
  
        } else {
            next();

        }
        session.send("Away uniform is currently set to " + localGame.awayTeam.uniform);
        builder.Prompts.text(session, "If you want to change it, please enter a new uniform color");

    },
    function (session, results) {

        if (results.response) {
                localGame.awayTeam.uniform = results.response;
                addToRawTicker("awayUniformEntered", "", localGame.awayTeam.uniform);
                session.send("Away Uniform is now %s", localGame.awayTeam.uniform);  
        } else {
            next();

        }
        
        session.endDialog();

    }
]);

bot.dialog('/location', [
    function (session) {
        session.send("Field Name is currently set to " + localGame.location.fieldName);
        builder.Prompts.text(session, "If you want to change it, please enter a new field name");

    },
    function (session, results) {

        if (results.response) {
                localGame.location.fieldName = results.response;
                addToRawTicker("fieldNameEntered", "", localGame.location.fieldName);
                session.send("Field name is now %s", localGame.location.fieldName);  
        } else {
            next();

        }
        session.send("Field number is currently set to " + localGame.location.fieldNumber);
        builder.Prompts.number(session, "If you want to change it, please enter a new field number");

    },
    function (session, results) {
        if (results.response) {
                localGame.location.fieldNumber = results.response;
                addToRawTicker("fieldNumberEntered", "", localGame.location.fieldNumber);
                session.send("Field Number is now %s", localGame.location.fieldNumber);    
  
        } else {
            next();

        }
        session.send("City is currently set to " + localGame.location.fieldCity);
        builder.Prompts.text(session, "If you want to change it, please enter a new city");

    },
    function (session, results) {

        if (results.response) {
                localGame.location.fieldCity = results.response;
                addToRawTicker("cityEntered", "", localGame.location.fieldCity);
                session.send("City is now %s", localGame.location.fieldCity);    
        } else {
            next();

        }
        session.send("State is currently set to " + localGame.location.fieldState);
        builder.Prompts.text(session, "If you want to change it, please enter a new state ");

    },
    function (session, results) {
        if (results.response) {
                localGame.location.fieldState = results.response;
                addToRawTicker("stateEntered", "", localGame.location.fieldState);
                session.send("State is now %s", localGame.location.fieldState);    
        } else {
            next();
        }
        session.send("Country is currently set to " + localGame.location.fieldCountryl);
        builder.Prompts.text(session, "If you want to change it, please enter a new country");

    },
    function (session, results) {
        if (results.response) {
                localGame.location.fieldCountry = results.response;
                addToRawTicker("countryEntered", "", localGame.location.fieldCountry);
                session.send("Country is now %s", localGame.location.fieldCountry);    
        } else {
            next();
        }
        session.endDialog();
    }
]);

bot.dialog('/schedule', [
    function (session) {
        session.send("Kick off is currently set to " + localGame.kickoff.startTime);
        builder.Prompts.text(session, "If you want to change it, please enter a new time hh:mm");

    },
    function (session, results) {

        if (results.response) {
                localGame.kickoff.startTime = results.response;
                addToRawTicker("startTimeEntered", "", localGame.kickoff.startTime);
                session.send("Kick off time is now %s", localGame.kickoff.startTime);  
        } else {
            next();

        }
        session.send("Time Zone is set to " + localGame.kickoff.timeZone);
        builder.Prompts.text(session, "If you want to change it, please enter a new timezone TTT");

    },
    function (session, results) {
        if (results.response) {
                localGame.kickoff.timeZone = results.response;
                addToRawTicker("timeZoneEntered", "", localGame.kickoff.timeZone);
                session.send("Kick off is now %s %s", localGame.kickoff.startTime, kickoff.timeZone);    
  
        } else {
            next();

        }
        session.endDialog();
    }
]);

bot.dialog('/weather', [
    //TO DO reorder to include visibility before precipitation
    //To DO add celcius
    //TO DO add wind speed
    function (session) {
        session.send("Temperature is currently set to " + localGame.weather.temperature);
        builder.Prompts.number(session, "If you want to change it, please enter a new temperature");

    },
    function (session, results) {

        if (results.response) {
                localGame.weather.temperature = results.response;
                addToRawTicker("temperatureEntered", "", localGame.weather.temperature);
                session.send("Temperature is now %s", localGame.weather.temperature);  
        } else {
            next();

        }
        session.send("Right now I think it's " + localGame.weather.precipitation);
        builder.Prompts.choice(session, "Is it fine, raining or snowing?", "Dry|Raining|Snowing");

    },
    function (session, results) {
        if (results.response) {
                localGame.weather.precipitation = results.response.entity;
                addToRawTicker("precipitationEntered", "", localGame.weather.precipitation);
                session.send("It's now %s", localGame.weather.precipitation);    
  
        } else {
            next();

        }
        session.send("Visibility is " + localGame.weather.visibility);
        builder.Prompts.choice(session, "Is it sunny, partially cloudy or overcast?", "Sunny|Partially Cloudy|Overcast");

    },
    function (session, results) {

        if (results.response) {
                localGame.weather.visibility = results.response.entity;
                addToRawTicker("visibilityEntered", "", localGame.weather.visibility);
                session.send("Thanks, I've got the weather as %s, %s and %s", localGame.weather.temperature, weather.precipitation, weather.visibility);    
        } else {
            next();

        }
        session.endDialog();
    }
]);



//=========================================================
// 2nd Level Dialogs - Goal
//=========================================================

bot.dialog('/homeScored', [
    function (session) {
        session.send("Which " + localGame.homeTeam.club + " Player Scored?");
        builder.Prompts.number(session, "Now enter a number.");
    },
    function (session, results) {
               //TO DO - add player names
        session.send(localGame.homeTeam.club + " Player '%s' scored!", results.response);
        addToRawTicker("homeTeamGoal", localGame.homeTeam.roster[results.response]);
               //TO DO - make assist optional
        session.send("Which " + localGame.homeTeam.club + " Player Assisted?");
        builder.Prompts.number(session, "Now enter a number.");
    },
    function (session, results) {
        session.send(localGame.homeTeam.club + " Player '%s' assisted!", results.response);
        addToRawTicker("homeTeamAssist", localGame.homeTeam.roster[results.response]);
        session.endDialog();
    }
]);

bot.dialog('/awayScored', [
    function (session) {
        session.send("Which " + localGame.awayTeam.club + " Player Scored?");
        builder.Prompts.number(session, "Now enter a number.");
    },
    function (session, results) {
                       //TO DO - add player names
        session.send(localGame.awayTeam.club + " Player '%s' scored!", results.response);
        addToRawTicker("awayTeamGoal", results.response.toString());
        //TO DO - make assist optional
        session.send("Which " + localGame.awayTeam.club + " Player Player Assisted?");
        builder.Prompts.number(session, "Now enter a number.");
    },
    function (session, results) {
        session.send(localGame.awayTeam.club + " Player '%s' assisted!", results.response);
        addToRawTicker("awayTeamAssist", results.response.toString());
        session.endDialog();
    }
]);

//=========================================================
// 2nd Level Dialogs - Shot
//=========================================================

bot.dialog('/homeShot', [
    function (session) {
        session.send("Which " + localGame.homeTeam.club + " Player Shot?");
        builder.Prompts.number(session, "Now enter a number.");
    },
    function (session, results) {
        playerNumber = results.response;
        builder.Prompts.confirm(session, "Was "+ localGame.homeTeam.club + " Player " + playerNumber + " shot on target?!");
    },
    function (session, results) {
        session.send("You chose '%s'", results.response ? 'yes' : 'no');
        if (results.response == '1') {
                // session.send(homeTeam.club + " Player '%s' %s %s shot on target!", playerNumber,localGame.homeTeam.roster[playerNumber].firstName,localGame.homeTeam.roster[playerNumber].lastName );
                session.send(localGame.homeTeam.club + " Player '%s' %s%sshot on target!", playerNumber, ((localGame.homeTeam.roster[playerNumber].firstName + " ") || "") , ((localGame.homeTeam.roster[playerNumber].lastName + " ") || "" ));
                addToRawTicker("homeTeamShotOnTarget", localGame.homeTeam.roster[playerNumber], "");
        } else {
                session.send(localGame.homeTeam.club + " Player '%s' %s%sshot off target!", playerNumber,localGame.homeTeam.roster[playerNumber].firstName + " ", localGame.homeTeam.roster[playerNumber].lastName + " " );
                addToRawTicker("homeTeamShotOffTarget", localGame.homeTeam.roster[playerNumber], "");
        }
        session.endDialog();
    }
]);

bot.dialog('/awayShot', [
    function (session) {
        session.send("Which " + localGame.awayTeam.club + " Player Shot?");
        builder.Prompts.number(session, "Now enter a number.");
    },
    function (session, results) {
        playerNumber = results.response;
        builder.Prompts.confirm(session, "Was "+ localGame.awayTeam.club + " Player " + playerNumber + " shot on target?!");
    },
    function (session, results) {
        session.send("You chose '%s'", results.response ? 'yes' : 'no');
        if (results.response == '1') {
                // session.send(homeTeam.club + " Player '%s' %s %s shot on target!", playerNumber,localGame.homeTeam.roster[playerNumber].firstName,localGame.homeTeam.roster[playerNumber].lastName );
                session.send(localGame.awayTeam.club + " Player '%s' %s%sshot on target!", playerNumber,localGame.awayTeam.roster[playerNumber].firstName + ' ' , localGame.awayTeam.roster[playerNumber].lastName + " ");
                addToRawTicker("awayTeamShotOnTarget", localGame.awayTeam.roster[playerNumber], "");
        } else {
                session.send(localGame.awayTeam.club + " Player '%s' %s%sshot off target!", playerNumber,localGame.awayTeam.roster[playerNumber].firstName + ' ' , localGame.awayTeam.roster[playerNumber].lastName + " ");
                addToRawTicker("awayTeamShotOffTarget", localGame.awayTeam.roster[playerNumber], "");
        }
        session.endDialog();
    }
]);

// 

//=========================================================
// 2nd Level Dialogs - Whistle
// TO DO not all buttons shoiwng seems to be max 6
// TO DO add details ot all dialogs goalKick & onwards
//=========================================================

bot.dialog('/kickOff', [
    function (session) {
        if (whichHalf() == "First") {
            session.send("1st Half Kick Off in the %s vs %s game", localGame.homeTeam.club, localGame.awayTeam.club);
            addToRawTicker("kickoff_1stHalf");
            session.endDialog();
        } else {
            session.send("2nd Half Kick Off in the %s vs %s game", localGame.homeTeam.club, localGame.awayTeam.club);
            addToRawTicker("kickoff_2ndHalf");
            session.endDialog();
        }
    }
]);

bot.dialog('/finalWhistle', [
    function (session) {
        if (whichHalf() == "First") {
            session.send("End of 1st Half in the %s vs %s game", localGame.homeTeam.club, localGame.awayTeam.club);
            addToRawTicker("finalWhistle_1stHalf");
            session.endDialog();
        } else {
            session.send("End of 2nd Half in the %s vs %s game", localGame.homeTeam.club, localGame.awayTeam.club);
            addToRawTicker("finalWhistle_2ndHalf");
            session.endDialog();
        }
    }
]);

bot.dialog('/goalKick', [
    function (session) {
        session.send("Goal Kick");
        addToRawTicker("goalKick");
        session.endDialog();
    }
]);

bot.dialog('/throwIn', [
    function (session) {
        session.send("Throw In");
        addToRawTicker("throwIn");
        session.endDialog();
    }
]);

bot.dialog('/foul', [
    function (session) {
        session.send("Foul");
        addToRawTicker("foul");
        session.endDialog();
    }
]);

bot.dialog('/corner', [
    function (session) {
        session.send("Corner");
        addToRawTicker("corner");
        session.endDialog();
    }
]);

bot.dialog('/offside', [
    function (session) {
        session.send("Offside");
        addToRawTicker("offside");
        session.endDialog();
   }
]);

bot.dialog('/penalty', [
    function (session) {
        session.send("Penalty Kick");
        addToRawTicker("penalty");
        session.endDialog();
   }
]);

bot.dialog('/substitution', [
    function (session) {
        session.send("Substitution");
        addToRawTicker("substitution");
        session.endDialog();
   }
]);


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

