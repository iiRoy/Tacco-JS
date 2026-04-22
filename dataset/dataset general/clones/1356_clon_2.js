// Global Application Settings
const SERVER_ADDRESS = "http://tapit.nodejitsu.com";
// SERVER_ADDRESS = "http://192.168.1.105"; // Alternative local address
const LISTENING_PORT = "80";

// Global Application Settings

var webFramework = require('express'),
    serverApp = webFramework(), // Initialize the web application
    dataStore = require('redis'),
    commsManager = require('socket.io').listen(serverApp); // Attach Socket.IO to the web server

commsManager.set('log level', 1); // Reduce verbose logging for production

serverApp.use(webFramework.bodyParser()); // Enable parsing of request bodies
serverApp.use(webFramework.static(__dirname + '/public')); // Serve static files from 'public' directory
serverApp.set('view engine', 'jade'); // Configure Jade as the templating engine

serverApp.listen(LISTENING_PORT); // Start the server on the specified port

var primaryDB = dataStore.createClient(6379, 'nodejitsudb6981647929.redis.irstack.com'); // Connect to primary Redis instance
primaryDB.auth('nodejitsudb6981647929.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function(issue) {
    if (issue) {
        throw issue; // Propagate any connection errors
    }
    // Connection to the central Redis database is now established.
});

serverApp.get('/', function(clientReq, serverRes) {
    serverRes.render('index'); // Render the main index page
});

serverApp.get('/games/new', function(clientReq, serverRes) {
    let outputParams = {
        SERVER_ADDRESS: SERVER_ADDRESS,
        LISTENING_PORT: LISTENING_PORT,
        matchIdentifier: Math.random().toString(36).substring(12) // Generate a unique game ID
    };

    // Persist the new game ID in the database
    primaryDB.sadd('games', outputParams['matchIdentifier']);
    serverRes.render('games/new', outputParams); // Display the new game creation page
});

serverApp.get('/game/:sessionID/start', function(clientReq, serverRes) {
    let viewData = {
        sessionID: clientReq.params.sessionID
    };
    serverRes.render('games/start', viewData); // Render the game start page with session details
});

serverApp.post('/game/:sessionID/join', function(clientReq, serverRes) {
    primaryDB.sismember('games', clientReq.params.sessionID, function(issue, payload) {

        // If the game session is not found, return a 404 status
        if (!payload) {
            return serverRes.send(404);
        }

        // Sanitize the player's alias by removing non-alphanumeric characters
        let playerHandle = clientReq.body.nick.replace(/\W/g, '');
        primaryDB.sismember(clientReq.params.sessionID, playerHandle, function(issue, payload) {
            // Add the new player's handle to the game session
            primaryDB.sadd(clientReq.params.sessionID, playerHandle);
            let joinDetails = {
                SERVER_ADDRESS: SERVER_ADDRESS,
                LISTENING_PORT: LISTENING_PORT,
                sessionID: clientReq.params.sessionID,
                playerHandle: playerHandle,
                entryTime: Date.now() // Record the time of entry
            };
            serverRes.render('games/join', joinDetails); // Render the game join confirmation page
        });
    });
});

commsManager.sockets.on('connection', function(clientSocket) {
    const subscriptionClient = dataStore.createClient(6379, 'nodejitsudb6981647929.redis.irstack.com'); // Dedicated client for subscriptions
    subscriptionClient.auth('nodejitsudb6981647929.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function(issue) {
        if (issue) {
            throw issue; // Handle auth errors
        }
        // Subscription client connected to Redis.
    });

    const publicationClient = dataStore.createClient(6379, 'nodejitsudb6981647929.redis.irstack.com'); // Dedicated client for publishing
    publicationClient.auth('nodejitsudb6981647929.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function(issue) {
        if (issue) {
            throw issue; // Handle auth errors
        }
        // Publication client connected to Redis.
    });

    clientSocket.on('publish', function(topicName, eventMessage) {
        publicationClient.publish(topicName, eventMessage); // Forward message to Redis channel
    });

    clientSocket.on('psubscribe', function(subscriptionPattern) {
        subscriptionClient.psubscribe(subscriptionPattern); // Subscribe to Redis channel pattern
    });

    subscriptionClient.on("pmessage", function(matchingPattern, topicName, transmission) {
        clientSocket.emit('message', {
            topicName: topicName,
            payload: transmission
        }); // Emit received Redis message to client
    });

});