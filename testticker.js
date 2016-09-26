// var restify = require('restify');
// var builder = require('botbuilder');

//=========================================================
// Ticker Setup
//=========================================================



function player () {
    this.firstName = "";
    this.lastName = "";
    this.position = "";
    this.photo = null;
}

function team() {
    this.teamName = "";
    this.club = "";
    this.ageGroup = "";
    this.gender = "";
    this.uniform = "";
    this.roster = new Array();
    this.latestScore = 0;
}

function tickerEvent () {
    this.timestamp = "";
    this.event = "";
    this.player = "";
    this.details = "";
    this.user = "";
}

var ticker = new Array();

var addToRawTicker = function (event, player, details) {
    var oTickerEvent = new tickerEvent();
    oTickerEvent.timestamp = new Date();
    oTickerEvent.event = event;
    oTickerEvent.player = player;
    oTickerEvent.details = details;
    oTickerEvent.user = "Tom";
    ticker.push(oTickerEvent);
};

function latestScores (team) {
    team.latestScore = team.latestScore + 1;
    return team.latestScore;
}

//=========================================================
// Set up match data
//=========================================================

var homeTeam = new team;
homeTeam.teamName ="Home";
var awayTeam = new team;
awayTeam.teamName = "Away";

//=========================================================
// Set up dummy data
//=========================================================

homeTeam.teamName = "G04 Schmetzer";
addToRawTicker("homeTeamEntered",'',homeTeam.teamName);
homeTeam.club = 'Crossfire';
addToRawTicker("homeClubEntered",'',homeTeam.club);
homeTeam.roster[7] = new player;
homeTeam.roster[7].firstName ="Poppy";
homeTeam.roster[7].lastName ="Honeybone";
homeTeam.roster[2] = new player;
homeTeam.roster[2].firstName ="Riley";
homeTeam.roster[2].lastName ="McQuade";

awayTeam.teamName = "G04 Copa";
addToRawTicker("awayTeamEntered",'',awayTeam.teamName);
awayTeam.club = 'Seattle United';
addToRawTicker("awayClubEntered",'',awayTeam.club);

addToRawTicker("Goal", "unknown", "unknown");
addToRawTicker("Shot", "unknown", "unknown");
addToRawTicker("Whistle", "unknown", "unknown");
addToRawTicker("Goal");
addToRawTicker("Assist", homeTeam.roster[7]);

    ticker.forEach(function(tick) {
        console.log(tick.event + " " + tick.player + " " + tick.details + " " + tick.timestamp.toString().slice(16,28));
    });

    homeTeam.roster.forEach(function(number) {
        console.log(number.firstName + number.lastName + number.position);
    });
    playerNumber = 7;
    console.log(homeTeam.club + " Player '%s' %s%sshot on target!", playerNumber, homeTeam.roster[playerNumber]? homeTeam.roster[playerNumber].firstName + ' ' : '',homeTeam.roster[playerNumber]? homeTeam.roster[playerNumber].lastName + ' ': '' );

console.log('Home Team latestScore ' + homeTeam.latestScore);
console.log('Away Team latestScore ' + awayTeam.latestScore);

// updateScores(homeTeam);

console.log('Home Team latestScore ' + latestScores(homeTeam));
console.log('Away Team latestScore ' + latestScores(awayTeam));

// updateScores(awayTeam);

console.log('Home Team latestScore ' + latestScores(homeTeam));
console.log('Away Team latestScore ' + latestScores(awayTeam));

//=========================================================
// Web Server Setup
//=========================================================

// Setup Restify Server
// var server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, function () {
//    console.log('%s listening to %s', server.name, server.url); 
// });

// server.get('/', function (req, res) { 
//     ticker.forEach(function(tick) {
//         console.log(tick.timestamp);
//         console.log(tick.user);
//         res.send(tick.timestamp);
//         res.send(tick.user);
//     });
//     console.log('Parrot Bot is online'); 
//     }); 