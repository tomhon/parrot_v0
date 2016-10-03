// ADD THIS PART TO YOUR CODE
var config = {}

config.endpoint = "https://parrotv0.documents.azure.com:443/";
config.primaryKey = "OeDBxR3YkievtgFrkqFyoV2UviakXtiegUdETg9A3JkMLtBRAd0Z4ECmCrGjccZVF9hGFCaTrfuE9IBmXN36Tw==";

config.database = {
    "id": "soccer"
};

config.collection = {
    "id": "games"
};

function player () {
    this.firstName = "";
    this.lastName = "";
    this.jerseyNumber = "";
    this.position = "";
    this.photo = null;
}

function tickerEvent () {
    this.timestamp = "";
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
    this.roster = new Array();
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


config.documents = {
    "game2": {
        "id": "002",
        "mappingId" : "002",
        "latestUpdateTime" : new Date(),
        "homeTeam": {
            "teamDetails": new team,
            "goals": [new goal],
            "shots": [new shot],
            "whistles": [new whistle]    
            },
        "awayTeam": {
            "teamDetails": new team,
            "goals": [new goal],
            "shots": [new shot],
            "whistles": [new whistle]             
            },
        "conditions": {
                "location": "60 acres",
                "weather": "sunny"
            },
        "tournamentOrLeague": {
            "name": "",
            "stage": ""
            },
        "events" : [new tickerEvent()]
    },
        "game3": {
        "id": "003",
        "mappingId" : "003",
        "latestUpdateTime" : new Date(),
        "homeTeam": {
            "teamDetails": new team,
            "goals": [new goal],
            "shots": [new shot],
            "whistles": [new whistle]    
            },
        "awayTeam": {
            "teamDetails": new team,
            "goals": [new goal],
            "shots": [new shot],
            "whistles": [new whistle]             
            },
        "conditions": {
                "location": "Marymoor Park",
                "weather": "sunny"
            },
        "tournamentOrLeague": {
            "name": "",
            "stage": ""
            },
        "events" : [new tickerEvent()]
    },

};

module.exports = config;