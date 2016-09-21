var restify = require('restify');
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

var oTickerEvent = new tickerEvent();
oTickerEvent.timestamp = "09:00";
oTickerEvent.user = "Fiona";
ticker.push(oTickerEvent);

var oTickerEvent = new tickerEvent();
oTickerEvent.timestamp = "10:00";
oTickerEvent.user = "Max";
ticker.push(oTickerEvent);

    ticker.forEach(function(tick) {
        console.log(tick.timestamp);
        console.log(tick.user);
    });

//=========================================================
// Web Server Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

server.get('/', function (req, res) { 
    ticker.forEach(function(tick) {
        console.log(tick.timestamp);
        console.log(tick.user);
        res.send(tick.timestamp);
        res.send(tick.user);
    });
    console.log('Parrot Bot is online'); 
    }); 