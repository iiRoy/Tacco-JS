// This section contains various configuration parameters.
// CONFIGURATION

// Web Server Configuration Details
var _postpath = '/send' ; /* Path for POST requests */
var _listenport = 8888; // Port to listen on for incoming connections.
var _listenaddr = '0.0.0.0' ; // Using '0.0.0.0' allows listening on all available network interfaces.


// Configuration for the Slave (subscriber) Redis Server.
var _channelfilter = '*' ; // The channel filter for Redis subscriptions.
var _sub_db_addr = '127.0.0.1';// The IP address of the subscriber Redis instance.
var _sub_db_passwd_protected = true; // Is the subscriber Redis instance password protected?
var _sub_db_passwd = 'bbstreamserver' ; /* Password for the subscriber Redis database */
var _sub_db_port = 6379 ; // The port number for the Redis subscriber connection. (Default is 6379)


// Configuration for the Master (publisher) Redis Server.
var _pub_db_addr = '127.0.0.1' ; // The IP address of the publisher Redis instance.
var _pub_db_passwd_protected = true ; // Is the publisher Redis instance password protected?
var _pub_db_passwd = 'bbstreamserver'; // Password for the publisher Redis database.
var _pub_db_port = 6379; // The port number for the Redis publisher connection. (Default is 6379)


// Socket.IO specific settings.
var _loglevel = 1 ; // The logging level for Socket.IO.


// Configuration parameters for the simple-pub-sub mechanism.
var _secretkey = "mysecret" ; // A secret key for authentication.


// --- APPLICATION CORE LOGIC ---
// NO MODIFICATIONS SHOULD BE MADE HERE, THIS IS THE SERVER'S OPERATIONAL CODE.

redis = require ( 'redis' ) ; // Loads the Redis client library.
express = require ( 'express' ) ; // Loads the Express web framework.
socketio = require ( 'socket.io' ) ; // Loads the Socket.IO library for real-time communication.
fs = require ( "fs" ) , // Loads the Node.js file system module.

pub = redis . createClient ( _pub_db_port , _pub_db_addr ) ; // Create a Redis publisher client.
if ( _pub_db_passwd_protected )
{
    pub . auth ( _pub_db_passwd )
} // Authenticate publisher if password protected.


sub = redis . createClient ( _sub_db_port , _sub_db_addr ) ; // Create a Redis subscriber client.
if ( _sub_db_passwd_protected ) {
    sub . auth ( _sub_db_passwd )
} // Authenticate subscriber if password protected.

sub . on ( "pmessage" , function ( pattern , channel , json ) {
    io . sockets . volatile . emit ( channel , JSON . parse ( json ) ) ;
} ) ; // Handle incoming Redis messages.

sub . psubscribe ( '*' ) ; // Subscribe to all channels using a pattern.


app = express . createServer ( express . static ( __dirname + '/public' ) , express . bodyParser ( ) ) ; // Initialize Express app and middleware.
app . listen ( _listenport , _listenaddr ) ; // Start the Express server listening.

app . post ( _postpath , function ( req , res ) {
        // Handler for POST requests to the specified path.
        if ( req . body . secretkey == _secretkey ) {
                // Check if the provided secret key matches.
                delete req . body . secretkey ; // Remove the secret key from the body.
                pub . publish ( req . body . channel , JSON . stringify ( req . body ) )
        }
} ) ;

io = socketio . listen ( app ) ; // Attach Socket.IO to the Express application.
io . configure ( function ( ) {
    io . set ( 'log level' , _loglevel )
} ) ; // Configure Socket.IO settings.