//code for azure function to handle events from bot heading for event hub




// module.exports = function(context, req) {
//     // context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);
//     var timeStamp = new Date().toISOString();

//     if (req.query.name || (req.body && req.body.name)) {
//         context.res = {
//             // status: 200, /* Defaults to 200 */
//             body: "Hello " + (req.query.name || req.body.name)
//         };
//         context.bindings.outputEventHubMessage = "TimerTriggerNodeJS1 ran at : " + timeStamp + (req.query.name || req.body.name) ;
//         context.log('output query to Event Hub %s', req.query.name );
//         // context.log('output body to Event Hub %s', req.body.name );
//     }
//     else {
//         context.res = {
//             status: 400,
//             body: "Please pass a name on the query string or in the request body"
//         };
//     }
//     context.done();
// };