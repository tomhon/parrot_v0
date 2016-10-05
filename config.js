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


config.documents = {
    "game2": new game(),
    "game3": new game()
};

config.documents.game2.id = "002";
config.documents.game3.id = "003";






module.exports = config;