/* This file contains server-side logic for the application. */

// --- Global Configuration Settings ---
HOST = "http://tapit.nodejitsu.com" ; // The primary host URL for the application.
PORT = "80" ; // The port number on which the application listens.

// --- Core Module Imports and Server Initialization ---
var express = require('express')
    , app = express.createServer() // Initialize the Express application.
    , redis = require('redis') // Redis client for database operations.
    , io = require('socket.io').listen(app) // Socket.IO for real-time communication.
;

// Adjust Socket.IO logging verbosity.
io.set('log level', 10); // Set log level to reduce console output during runtime.

// Configure Express middleware.
app.use(express.bodyParser()); // Enable parsing of request bodies.

app.use(express.static(__dirname + '/public')); // Serve static files from the 'public' directory.

app.set('view engine', 'jade'); // Set Jade as the default templating engine.

// Start the Express server, listening on the configured port.
app.listen(PORT);

// --- Redis Database Connection Setup ---
var DB = redis.createClient(6379, 'nodejitsudb6981647929.redis.irstack.com'); // Main application Redis client.

DB.auth('nodejitsudb6981647929.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function (err) {
    if (err) { // Check for authentication errors.
        throw err;
    }
    // Successfully connected to the primary Redis instance.
});

// --- Application Routes ---

// Default route: Renders the main index page.
app.get('/', function(req, res) {
    res.render('index');
});

// Route for creating a new game.
app.get('/games/new', function ( req , res ) {
    data = { HOST: HOST, PORT: PORT, // Pass host and port to the view.
        gameid: Math.random().toString(36).substring(12) // Generate a unique game ID.
    } ;

    // Persist the new game ID in the database.
    DB.sadd('games', data['gameid']);
    res.render('games/new', data); // Render the new game creation view.
});

// Route to initiate a game session.
app.get('/game/:gameid/start', function(req, res) {
    data = { gameid: req.params.gameid } ; // Extract game ID from URL parameters.
    res.render('games/start', data); // Render the game start view.
});

// Route for a player to join an existing game.
app.post('/game/:gameid/join', function ( req , res ) {
    DB.sismember('games', req.params.gameid, function(err, data) {

        // If the game ID is not found in the 'games' set, return 404.
        if ( ! data ) return res.send(404);

        // Sanitize the nickname to remove non-alphanumeric characters.
        nick = req.body.nick.replace(/\W/g, '') ;
        DB.sismember(req.params.gameid, nick, function(err, data) {
            // Add the new member's nickname to the game-specific set.
            DB.sadd(req.params.gameid, nick);
            params = { HOST: HOST, PORT: PORT, // Configuration for the client.
                gameid: req.params.gameid,
                nick: nick,
                ts: Date.now() // Timestamp of joining.
            } ;
            res.render('games/join', params); // Render the game join view with player details.
        });
    });
});

// --- Socket.IO Event Handling ---
io.sockets.on('connection', function(socket) {
    // Dedicated Redis client for subscribing to channels.
    const subscribe = redis.createClient(6379, 'nodejitsudb6981647929.redis.irstack.com');
    subscribe.auth('nodejitsudb6981647929.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function (err) {
        if (err) { throw err; } // Handle authentication failure.
        // Subscriber client is ready.
    });

    // Dedicated Redis client for publishing messages.
    const publish = redis.createClient(6379, 'nodejitsudb6981647929.redis.irstack.com');
    publish.auth('nodejitsudb6981647929.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function (err) {
        if (err) { throw err; } // Handle authentication failure.
        // Publisher client is ready.
    });

    // Handle 'publish' events from the client.
    socket.on('publish', function(channel, data) {
        publish.publish(channel, data); // Publish message to Redis channel.
    });

    // Handle 'psubscribe' events from the client.
    socket.on('psubscribe', function(channel) {
        subscribe.psubscribe(channel); // Pattern subscribe to Redis channel.
    });

    // When a message is received from Redis via psubscribe, emit it to the client.
    subscribe.on("pmessage", function(pattern, channel, message) {
        socket.emit('message', { channel: channel, data: message }); // Forward the message to the connected socket.
    });

});
/* End of server.js */