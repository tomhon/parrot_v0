// ADD THIS PART TO YOUR CODE
var config = {}

config.endpoint = "https://parrotv0.documents.azure.com:443/";
config.primaryKey = "OeDBxR3YkievtgFrkqFyoV2UviakXtiegUdETg9A3JkMLtBRAd0Z4ECmCrGjccZVF9hGFCaTrfuE9IBmXN36Tw==";

config.database = {
    "id": "soccer"
};

config.collection = {
    "id": "matches"
};

config.documents = {
    "game": {
        "id": "002",
        "homeTeam": {
            "name": "Crossfire",
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
            "location": "60 acres",
            "weather": "sunny"
    },
    "event": {
        "id" : "000",
        "timestamp" : new Date(),
        "eventType" : "goal",
        "player" : 7,
        "details" : "homeTeam",
        "user": "Tom"
    }
};

module.exports = config;