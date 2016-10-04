// var restify = require('restify');
// var builder = require('botbuilder');
var request = require('request');

//=========================================================
// DocumentDB Setup
//=========================================================


var documentClient = require("documentdb").DocumentClient;
var config = require("./config");
var url = require('url');

var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${config.database.id}`;
var collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;


function getDatabase() {
    console.log(`Getting database:\n${config.database.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDatabase(databaseUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDatabase(config.database, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

function getCollection() {
    console.log(`Getting collection:\n${config.collection.id}\n`);

    return new Promise((resolve, reject) => {
        client.readCollection(collectionUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createCollection(databaseUrl, config.collection, { offerThroughput: 400 }, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

function getMatchDocument(document) {
    var documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Getting document:\n${document.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, { partitionKey: document.district }, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrl, document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

function queryCollection() {
    console.log(`Querying collection through index:\n${config.collection.id}`);

    return new Promise((resolve, reject) => {
        client.queryDocuments(
            collectionUrl,
            'SELECT * FROM root r WHERE r.mappingId = "010"'
            // 'SELECT VALUE r.awayTeam.goals FROM root r WHERE r.mappingId = "003"'
        ).toArray((err, results) => {
            if (err) reject(err)
            else {
                for (var queryResult of results) {
                    var resultString = JSON.stringify(queryResult);
                    currentGame = queryResult;
                    console.log(`\tQuery returned ${resultString}`);
                    console.log('break')
                }
                console.log();
                resolve(results);
            }
        });
    });
};

function replaceFamilyDocument(document) {
    var documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Replacing document:\n${document.id}\n`);
    document.awayTeam.teamDetails.teamName = "Seattle United" ;

    return new Promise((resolve, reject) => {
        client.replaceDocument(documentUrl, document, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};

function exit(message) {
    console.log(message);
    console.log('Press any key to exit');
    // process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

// getDatabase()
// .then(() => getCollection())
// .then(() => {console.log('Got Collection')})
// .then(() => getMatchDocument(config.documents.game2))
// .then(() => getMatchDocument(config.documents.game3))
// .then(() => queryCollection())

// .then(() => replaceFamilyDocument(config.documents.game2))
// .then(() => queryCollection())


// .then(() => { exit(`Completed successfully`); })
// .catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });

//=========================================================
// Ticker Setup
//=========================================================

var eventHubUrl = 'https://parrotrawevents.azurewebsites.net/api/HttpTriggerNodeJS1?code=n0rtoxjcoygj3v78iv7r885mi40dwr13vygz0wu74ftufcx47vihyflilseyuhj4oyw8jh71ra4i'
request( eventHubUrl + '&name=awayTeamGoal', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) 
  }
})


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
    this.latestUpdateTime = new Date()
    ,
    this.homeTeam = new team(),
    this.awayTeam = new team(),
    this.weather = new weather()
    this.schedule = new schedule();
    this.venue = new venue();
    this.events = new Array() //array of tickerEvent

}


//=========================================================
// Game Setup
//=========================================================



var localGame = new game();
localGame.id = "001";
localGame.mappingId = localGame.id;
console.log(localGame);
console.log(localGame);
config.documents.game = localGame;


getDatabase()
.then(() => getCollection())
.then(() => {console.log('Got Collection')})
.then(() => getMatchDocument(config.documents.game))
.then(() => {addToRawTicker("Assist", homeTeam.roster[2]);})
.then(() => queryCollection())

// .then(() => replaceFamilyDocument(config.documents.game2))
// .then(() => queryCollection())


.then(() => { exit(`Completed successfully`); })
.catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });







var ticker = new Array();

// var addToRawTicker = function (event, player, details) {
//     var oTickerEvent = new tickerEvent();
//     oTickerEvent.event = event;
//     oTickerEvent.player = player;
//     oTickerEvent.details = details;
//     oTickerEvent.user = "Tom";
//     ticker.push(oTickerEvent);
//     request( eventHubUrl + '&game=' + JSON.stringify(oTickerEvent), function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//         console.log('logged to Event Hub - response = ' + body) 
//     }
//     })
// };

var addToRawTicker = function (event, player, details) {
    var oTickerEvent = new tickerEvent();
    oTickerEvent.event = event;
    oTickerEvent.player = player;
    oTickerEvent.details = details;
    oTickerEvent.user = "Tom";
    ticker.push(oTickerEvent);
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

var currentSharedGame = ""; //local copy of DocDB instance of the game status


// function latestScores (team,event) {
//     team.latestScore = 0; 
//     ticker.forEach(function(tick) {
//         if (tick.event == event) {
//             team.latestScore +=1;
//         }   
//     });
//     return team.latestScore;
// }

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
addToRawTicker("homeTeamEntered",'7',homeTeam.teamName);
homeTeam.club = 'Crossfire';
addToRawTicker("homeClubEntered",'7',homeTeam.club);
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
addToRawTicker("homeTeamGoal", "unknown", "unknown");
addToRawTicker("awayTeamGoal", "unknown", "unknown");
addToRawTicker("homeTeamGoal", "unknown", "unknown");
addToRawTicker("awayTeamGoal", "unknown", "unknown");
addToRawTicker("homeTeamGoal", "unknown", "unknown");
addToRawTicker("Shot", "unknown", "unknown");
addToRawTicker("Whistle", "unknown", "unknown");
addToRawTicker("Goal","unknown", "unknown");
addToRawTicker("Assist", homeTeam.roster[7]);
addToRawTicker("kickoff_1stHalf","unknown", "unknown");

addToRawTicker("Goal", "unknown", "unknown");
addToRawTicker("homeTeamGoal", "unknown", "unknown");
addToRawTicker("awayTeamGoal", "unknown", "unknown");
addToRawTicker("homeTeamGoal", "unknown", "unknown");
addToRawTicker("awayTeamGoal", "unknown", "unknown");
addToRawTicker("homeTeamGoal", "unknown", "unknown");
addToRawTicker("Shot", "unknown", "unknown");
addToRawTicker("Whistle", "unknown", "unknown");
addToRawTicker("Goal","unknown", "unknown");
addToRawTicker("Assist", homeTeam.roster[7]);
addToRawTicker("kickoff_1stHalf","unknown", "unknown");

    // ticker.forEach(function(tick) {
    //     console.log(tick.event + " " + tick.player + " " + tick.details + " " + tick.timestamp.toString().slice(16,28));
    // });

    // homeTeam.roster.forEach(function(number) {
    //     console.log(number.firstName + number.lastName + number.position);
    // });
    
    
// playerNumber = 7;
// console.log(homeTeam.club + " Player '%s' %s%sshot on target!", playerNumber, homeTeam.roster[playerNumber]? homeTeam.roster[playerNumber].firstName + ' ' : '',homeTeam.roster[playerNumber]? homeTeam.roster[playerNumber].lastName + ' ': '' );

// console.log('Home Team latestScore ' + homeTeam.latestScore());
// console.log('Away Team latestScore ' + awayTeam.latestScore());

// // updateScores(homeTeam);

// console.log('Home Team latestScore ' + latestScores(homeTeam,'homeTeamGoal'));
// console.log('Away Team latestScore ' + latestScores(awayTeam, 'awayTeamGoal'));

// var location = new venue();

// console.log('Home Team latestScore ' + homeTeam.latestScore('homeTeamGoal'));
// console.log('Away Team latestScore ' + awayTeam.latestScore('awayTeamGoal'));
// // updateScores(awayTeam);

// console.log('Home Team latestScore ' + latestScores(homeTeam));
// console.log('Away Team latestScore ' + latestScores(awayTeam));

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