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

function exit(message) {
    console.log(message);
    console.log('Press any key to exit');
    // process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

getDatabase()
.then(() => getCollection())
.then(() => {console.log('Got Collection')})
.then(() => getMatchDocument(config.documents.game))
// .then(() => getMatchDocument(config.documents.event))

.then(() => { exit(`Completed successfully`); })
.catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });

//=========================================================
// Ticker Setup
//=========================================================

var eventHubUrl = 'https://parrotrawevents.azurewebsites.net/api/HttpTriggerNodeJS1?code=n0rtoxjcoygj3v78iv7r885mi40dwr13vygz0wu74ftufcx47vihyflilseyuhj4oyw8jh71ra4i'
request( eventHubUrl + '&name=awayTeamGoal', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) 
  }
})

var game = {
    "id": "002",
    "latestUpdateTime" : new Date(),
        "homeTeam": {
            "name": "Crossfire",
            "goals": [{
                "time": "10:05:00",
                "scorer" : 7,
                "assist" : 3
            }, {
                "time": "10:06",
                "scorer" : 3,
                "assist" : 7
                }],
            "shots": [{
                "time": "10:09",
                "type": "onTarget",
                "shooter": 10
                }],
            "whistles": [{
                "whistleType": "Foul",
                "time": "10:09",
                "onTarget": "yes",
                "player": 11
                }]         
            },
        "awayTeam": {
            "name": "Seattle United",
            "goals": [{
                "time": "10:05",
                "scorer" : 7,
                "assist" : 3
            }, {
                "time": "10:06",
                "scorer" : 3,
                "assist" : 7
                }],
            "shots": [{
                "time": "10:09",
                "type": "onTarget",
                "shooter": 10
                }],
            "whistles": [{
                "whistleType": "Foul",
                "time": "10:09",
                "onTarget": "yes",
                "player": 11
                }]         
            },
            "conditions": {
                "location": "60 acres",
                "weather": "sunny"
            },
            "events" : [{
                 "event": {
                    "id" : "000",
                    "timestamp" : new Date(),
                    "eventType" : "goal",
                    "player" : 7,
                    "details" : "homeTeam",
                    "user": "Tom"
                    }
            }]
    },

}



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

var location = new venue();

console.log('Home Team latestScore ' + homeTeam.latestScore('homeTeamGoal'));
console.log('Away Team latestScore ' + awayTeam.latestScore('awayTeamGoal'));
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