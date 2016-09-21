var express = require('express');
var router = express.Router();

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