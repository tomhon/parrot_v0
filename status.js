var express = require('express');
var router = express.Router();

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


router.get('/', function (req, res) {
    // res.render('status' , {
    //     mappingList: cache.get("TEBEMappingList", arrayIsvTE)
    // });
    res.send('Parrot Bot Status is online'); 
    // res.send('Status Home Page')
    });

// router.get('/status', function (req, res) { 

//     res.send('Parrot Bot Status is online'); 
//     }); 

module.exports = router;