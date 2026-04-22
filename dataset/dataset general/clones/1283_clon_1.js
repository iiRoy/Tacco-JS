var PORT = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080; // Define the port for the application.
var IPADDRESS = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'; // Define the IP address for the application.

// Load necessary modules for the application to run.
var express = require('express'); // The core web framework.
var server; // Will hold the HTTP server instance.
var io; // Will hold the Socket.IO server instance.
var app; // Will hold the Express application instance.

// Import our common modules that are shared between client and server.
var Handlebars = require('./common/handlebars').Handlebars; // Templating engine.
var Message = require('./common/models').Message;           // Message model.
var User = require('./common/models').User;                 // User model.

// Grab any command line arguments that are passed in.
var argv = require('optimist').argv; // Argument parser.



// Setup a very simple express application instance.
app = express();

// Middleware to allow cross-origin requests.
app.use( function (req, res, next) {

  // Default origin is wildcard.
  var origin = '*';

  try {
    // Attempt to parse the referrer header to set a more specific origin.
    var parts = req.headers.referer.split('/').filter( function (n) { return n; } );

    // If enough parts are found, reconstruct the origin.
    if ( parts.length >= 2 ) {

      origin = parts[0] + '//' + parts[1];

    }
  }
  catch ( e ) {
    // If there's no referrer, or parsing fails, we fall back to the default origin.
    // This catch block handles cases where 'req.headers.referer' might be undefined.
  }

  // Set the Access-Control-Allow-Origin header.
  res.setHeader( 'Access-Control-Allow-Origin', origin );

  // Allow credentials to be sent with cross-origin requests.
  res.setHeader( 'Access-Control-Allow-Credentials', 'true' );

  // Pass control to the next middleware in the stack.
  next();

} );

// Middleware to provide the WebSocket URI to the client.
// This allows the client to dynamically connect to the correct WebSocket endpoint.
app.use( '/varSocketURI.js', function ( req, res ) {

  // Check for an optional WebSocket port provided via command line arguments.
  var port = argv['websocket-port'];

  // Modify the URI only if an optional connection port is specified.
  // If no port is specified, the root path '/' is used.
  var socketURI = port ? ':' + port + '/' : '/';

  // Set the content type to JavaScript.
  res.set( 'Content-Type', 'text/javascript' );

  // Send the JavaScript code that defines the socketURI variable on the client side.
  res.send( 'var socketURI=window.location.hostname+"' + socketURI + '";' );

} );

// Serve static files from the '/client' directory under the '/client' URL path.
// This contains client-specific assets like HTML, CSS, and client-side JavaScript.
app.use( '/client', express.static( __dirname + '/client' ) );

// Serve static files from the '/common' directory under the '/common' URL path.
// This directory holds code and assets shared by both client and server.
app.use( '/common', express.static( __dirname + '/common' ) );

// Handle GET requests to the root path '/'.
// This typically serves the main HTML file for the client application.
app.get( '/', function ( req, res ) {

  // Send the 'index.html' file located in the client directory.
  res.sendfile( __dirname + '/client/index.html' );

} );



// Our express application functions as our main listener for HTTP requests.
// In this example, we explicitly create an HTTP server and pass the express app to it,
// rather than directly invoking 'listen' on the app object.
server = require( 'http' ).createServer( app );

// Start the HTTP server, listening on the defined PORT and IPADDRESS.
server.listen( PORT, IPADDRESS );



// Our application's pool of active users.
var users = {

  // The actual list of currently connected users.
  list: [],

  // Method to add a new user to the pool.
  // Note: This implementation does not filter for duplicate users;
  // it simply adds the user to the list.
  add: function ( user ) {

    this.list.push( user );

    // Emit an updated user list to all connected sockets.
    io.sockets.emit( 'user-list', {
      'users': this.list
    } );

  },

  // Method to remove a user from the pool.
  // Returns true if the user was successfully found and removed,
  // otherwise returns false.
  remove: function ( user ) {

    // Find the index of the user in the list.
    var index = this.list.indexOf( user );

    // Check if the user was found.
    if ( index != -1 ) {

      // Remove the user from the list.
      this.list.splice( index, 1 );

      // Emit the updated user list to all connected sockets.
      io.sockets.emit( 'user-list', {
        'users': this.list
      } );

      // Indicate that a user was removed.
      return true;

    }

    // If the user was not found, no user was removed.
    return false;

  }

};



// List of message templates, compiled as Handlebars template functions.
// All messages, even simple strings without substitutions, are treated as
// Handlebars functions for consistency.
var messages = {

  // Messages that do not expect a context object for substitution.
  "welcome": Handlebars.compile( 'the chatty server welcomes you. before i let you join the chat room, please provide a username for yourself and hit return. please no spaces or special characters. letters, numbers, and underscores are okay.' ),
  "invalidRequireName": Handlebars.compile( 'sorry, you need to tell me your name first.' ),
  "invalidNameChange": Handlebars.compile( 'not sure what you did, but please do not change your username midchat.' ),

  // Messages that expect a context object (e.g., a user object) for substitution.
  "leftChatroom": Handlebars.compile( "{{name}} has left the chatroom." ),
  "haveFun": Handlebars.compile( 'have fun {{name}}.' ),
  "hasJoinedRoom": Handlebars.compile( '{{name}} has joined the chatroom.' ),
  "invalidName": Handlebars.compile( 'sorry, {{name}} is an invalid username. make sure there are no spaces or bizarre characters in your name (underscores are okay). disconnecting.' ),

};



// Initialize Socket.IO and augment our existing HTTP server instance.
io = require( 'socket.io' ).listen( server );

// Configure Socket.IO settings.
io.configure( function () {

  // Determine the logging level for Socket.IO.
  // Default is 3 (debug); can be overridden by 'log-level' command line argument.
  var logLevel = ( argv["log-level"] === undefined ) ? 3 : argv["log-level"];

  // Set the configured log level.
  io.set( "log level", logLevel );

} );

// Event listener for new connections from clients.
// The 'socket' object represents the individual connection with a client.
io.sockets.on( 'connection', function ( socket ) {

  // Initialize a new User object for this specific socket connection.
  var user = User();

  // Helper function to handle socket disconnection logic.
  var disconnectSocket = function () {

    // Attempt to remove the user from the global users pool.
    var wasUserRemoved = users.remove( user );

    // If the user had a name and was successfully removed, broadcast their departure.
    if ( user.name && wasUserRemoved ) {

      io.sockets.emit( 'chat', Message( messages.leftChatroom( user ) ) );

    }

    // Explicitly disconnect the socket.
    // The client is expected to deliver the final response after this.
    socket.disconnect();

  };



  // Send a welcome message to the newly connected client.
  socket.emit( 'chat', Message( messages.welcome() ) );



  // Set up listeners on the server side for this specific socket.

  // Listen for the 'disconnect' event. This listener is set up to fire only once.
  socket.once( 'disconnect', function () {

    // Respond if the client side voluntarily disconnects.
    // We use 'once' because multiple disconnect messages might fire
    // from client or server, but we only want to process it once per client.
    disconnectSocket();

  } );


  // Listen for 'set-name' events from the client.
  socket.on( 'set-name', function ( data ) {

    // Allow a user to set their username.
    // The username is expected to be simple (alphanumeric, no spaces).
    user.name = data.username;

    // Validate the provided username.
    if ( user.isValid() ) {

      // Add the user to the global list of active users.
      users.add( user );

      // Send a personalized welcome message back to the client.
      socket.emit( 'chat', Message( messages.haveFun( user ) ) );

      // Broadcast a message to all clients that this user has joined.
      io.sockets.emit( 'chat', Message( messages.hasJoinedRoom( user ) ) );

    }
    else {

      // If the username is invalid, send an error message to the client.
      socket.emit( 'chat', Message( messages.invalidName( user ), User( 'server' ), 'error' ) );

      // Disconnect the socket due to invalid username.
      disconnectSocket();

    }

  } );



  // Listen for 'chat' messages sent from the client.
  socket.on( 'chat', function ( data ) {

    // Message passed by a client to the server, intended for broadcasting.

    // Check if the message data includes a user and if that user's name matches
    // the current socket's assigned user name. This is a basic security check.
    if ( data.user && data.user.name == user.name ) {

      // If valid, broadcast the message to all connected clients.
      io.sockets.emit( 'chat', Message( data.message, user, "chat" ) );

    }
    else if ( !user.name ) {

      // If the user has not yet set a valid name, they cannot communicate.
      // Send an error message to the client.
      socket.emit( 'chat', Message( messages.invalidRequireName(), User( 'server' ), 'error' ) );

      // Disconnect the socket.
      disconnectSocket();

    }
    else {

      // This condition might indicate an attempt to change the username mid-chat
      // via the message payload, which is not allowed in this simple setup.
      // Send an error message to the client.
      socket.emit( 'chat', Message( messages.invalidNameChange(), User( 'server' ), 'error' ) );

      // Disconnect the socket.
      disconnectSocket();

    }

  } );

} );