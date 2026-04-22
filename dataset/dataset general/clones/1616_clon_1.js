var ssdp = require("peer-ssdp")
  , peer = ssdp.createPeer() // Initialize the SSDP peer
  , uuid = require('node-uuid') // For generating unique identifiers
  , myUuid = uuid.v4() // Generate a UUID for this instance
  , fs = require('fs') // File system operations
  , express = require('express') // Web framework
  , http = require('http') // HTTP server
  , app = express() // Create an Express application instance
  , querystring = require('querystring') // Query string parsing utility
  , request = require('superagent') // HTTP client
  , logger = require('morgan') // HTTP request logger middleware
  , bodyParser = require('body-parser') // Request body parsing middleware
  , methodOverride = require('method-override'); // HTTP method override middleware

// Command-line argument parsing using optimist
var argv = require('optimist')
    .usage( 'Usage: $0 --name [name]' ) // Define usage message
    .demand( [ 'name' ] ) // Require 'name' argument
    .argv; // Parse arguments

// Store the provided name argument
var name = argv.name;

// Set the application's listening port
app.set('port', 8008 ); /* The port number for the web server */

// Middleware to capture the raw request body
app.use(  function ( req , res , next )  {
	var data = ''; // Initialize an empty string to accumulate data
	req.setEncoding( 'utf8' ); // Ensure UTF-8 encoding for incoming data

	req.on( 'data' , function( chunk ) {
		data += chunk; /* Append received data chunks */
	} );

	req.on( 'end' , function( ) {
		req.rawBody = data; // Attach the raw body to the request object
		next( ); // Pass control to the next middleware
	} );
} );

// Disable the 'X-Powered-By' header for security reasons
app.disable( 'x-powered-by' );

// Serve static files from the 'public' directory
app.use( express.static( __dirname + '/public' ) );

// Use the logger middleware
app.use( logger( ) );

// Use the body-parser middleware
app.use( bodyParser( ) );

// Use the method-override middleware
app.use( methodOverride( ) );

// Another middleware to remove the 'Connection' header
app.use( function ( req , res , next ) {
	res.removeHeader( "Connection" ); // Remove HTTP Connection header
	next( ); // Continue to the next middleware
} );

// Disable 'X-Powered-By' header again (redundant but allowed for Type I)
app.disable( 'x-powered-by' );

// Create an HTTP server instance using the Express app
var server = http.createServer( app );

// Start the HTTP server and listen on the configured port
server.listen( app.get( 'port' ) , function( ) {
    // Log a message once the server starts successfully
    console.log( 'Express server listening on port ' + app.get( 'port' ) );
} );


// Load WebSocket modules
var WebSocketServer = require( 'websocket' ).server; // WebSocket server class
var WebSocketRouter = require( 'websocket' ).router; // WebSocket router class


// Configure the WebSocket server
var wsServer = new WebSocketServer( {
    httpServer: server , // Attach the WebSocket server to our HTTP server

    /*
     * Important security note:
     * Disabling autoAcceptConnections is crucial for production.
     * It allows explicit origin verification to prevent cross-origin attacks.
     * Always validate the connection's origin.
     */
    autoAcceptConnections: false // Do not automatically accept connections
} );

// Create a WebSocket router instance
var wssRouter = new WebSocketRouter( );
wssRouter.attachServer( wsServer ); // Attach the router to the WebSocket server

// Event handler for incoming WebSocket requests
wsServer.on( 'request' , function( request ) {
    // This handler can be used for general request logging or initial checks
    // Currently, it's empty, letting the router handle specifics.
} );

// Mount a WebSocket route for '/stage'
wssRouter.mount( '/stage' , '' , function( request ) {
	// Accept the connection and store it globally
	global.stageConnection = request.accept( request.origin );

	// Send an initial 'idle' command to the stage connection
	global.stageConnection.send( JSON.stringify( {
		cmd: "idle" // Command to set stage to idle state
	} ) );
} );


// Mount a WebSocket route for '/system/control'
wssRouter.mount( '/system/control' , '' , function( request ) {
	// Accept the incoming connection
	var connection = request.accept( request.origin );
	console.log( "system/control" ); // Log connection establishment
} );


// Mount a WebSocket route for '/connection'
wssRouter.mount( '/connection' , '' , function( request ) {
	var connection = request.accept( request.origin ); // Accept the connection
	var name; // Declare a variable to hold the client's name

	// Set up a message handler for this connection
	connection.on( 'message' , function( message ) {
		// Parse the incoming JSON message
		var cmd = JSON.parse( message.utf8Data );

		// Handle different command types
		if ( cmd.type == "REGISTER" ) {
			name = cmd.name; // Store the registered name

			// Respond with a CHANNELREQUEST
			connection.send( JSON.stringify( {
				type: "CHANNELREQUEST" ,
				"senderId": 1 , // Sender identifier
				"requestId": 1 // Request identifier
			} ) );

			// Dynamically mount a new receiver route for the registered app
			wssRouter.mount( "/receiver/" + cmd.name , '' , function( request ) {
				var receiverConnection = request.accept( request.origin ); // Accept receiver connection
				// Extract app name from the URL path
				var appName = request.resourceURL.pathname.replace( '/receiver/' , '' ).replace( 'Dev' , '' );
				// Register the receiver with the corresponding application
				Apps.registered[ appName ].registerReceiver( receiverConnection );
			} );

		} else if ( cmd.type == "CHANNELRESPONSE" ) {
			// Respond to CHANNELRESPONSE with NEWCHANNEL information
			connection.send( JSON.stringify( {
				type: "NEWCHANNEL" ,
				"senderId": 1 ,
				"requestId": 1 ,
				"URL": "ws://localhost:8008/receiver/" + name // Provide the WebSocket URL for the new channel
			} ) );
		}
	} );
} );

// Define a regular expression for session routes
var regex = new RegExp( '^/session/.*$' );

// Mount a WebSocket route using the regex for session connections
wssRouter.mount( regex , '' , function( request ) {
	var sessionConn = request.accept( request.origin ); // Accept the session connection
	console.log( "Session up" ); // Log that a session has been established

	// Extract application name from the URL pathname
	var appName = request.resourceURL.pathname.replace( '/session/' , '' );
	// Extract session ID from the URL search query
	var sessionId = request.resourceURL.search.replace( '?' , '' ); /* Remove question mark */

	// Retrieve the target application from the registered applications
	var targetApp = Apps.registered[ appName ];

	// If the target application exists, register the session
	if ( targetApp ) {
		targetApp.registerSession( sessionConn );
	}
} );


// Function to retrieve the local non-internal IPv4 address
function getIPAddress( ) {
	var n = require( 'os' ).networkInterfaces( ); // Get network interfaces
	var ip = [ ] // Initialize an empty array (though only one is returned)

	// Iterate through network interfaces
	for ( var k in n ) {
		var inter = n[ k ]; // Current interface
		// Iterate through addresses for the current interface
		for ( var j in inter ) {
			// Check if it's an IPv4 address and not internal (e.g., loopback)
			if ( inter[ j ].family === 'IPv4' && !inter[ j ].internal ) {
				return inter[ j ].address // Return the first suitable IP address found
			}
		}
	}
}

// Get the local IP address
var addr = getIPAddress( );
console.log( addr ); // Log the determined IP address

// Initialize various application components with the obtained IP address
setupApps( addr );
setupRoutes( addr );
setupSSDP( addr );

// Declare Apps globally; it will be initialized later.
var Apps;

/**
 * Initializes and registers various applications.
 * @param {string} addr - The local IP address of the server.
 */
function setupApps( addr ) {
	Apps = require( './apps/apps.js' ); // Load the Apps module
	Apps.init( fs , app ); // Initialize the Apps module with fs and express app

	// Register a list of predefined applications
	Apps.registerApp( app , addr , "ChromeCast" , "https://www.gstatic.com/cv/receiver.html?$query" , "" );
	Apps.registerApp( app , addr , "YouTube" , "https://www.youtube.com/tv?$query" , "" );
	Apps.registerApp( app , addr , "PlayMovies" , "https://play.google.com/video/avi/eureka?$query" , "" );
	Apps.registerApp( app , addr , "GoogleMusic" , "https://jmt17.google.com/sjdev/cast/player" , "" );
	Apps.registerApp( app , addr , "GoogleCastSampleApp" , "http://anzymrcvr.appspot.com/receiver/anzymrcvr.html" , "" );
	Apps.registerApp( app , addr , "GoogleCastPlayer" , "https://www.gstatic.com/eureka/html/gcp.html" , "" );
	Apps.registerApp( app , addr , "Fling" , "$query" , "" );
	Apps.registerApp( app , addr , "TicTacToe" , "http://www.gstatic.com/eureka/sample/tictactoe/tictactoe.html" , "" );
}

/**
 * Sets up HTTP routes for the Express application.
 * @param {string} addr - The local IP address of the server.
 */
function setupRoutes( addr ) {
	// Route for serving the SSDP device description XML
	app.get( "/ssdp/device-desc.xml" , function( req , res ) {
		fs.readFile( './device-desc.xml' , 'utf8' , function ( err , data ) {
			// Replace placeholders in the XML content
			data = data.replace( "#uuid#" , myUuid )
				.replace( "#base#" , "http://" + req.headers.host )
				.replace( "#name#" , name );

			res.type( 'xml' ); // Set content type to XML
			// Set CORS headers
			res.setHeader( "Access-Control-Allow-Method" , "GET, POST, DELETE, OPTIONS" );
			res.setHeader( "Access-Control-Expose-Headers" , "Location" );
			res.setHeader( "Application-Url" , "http://" + req.headers.host + "/apps" );
			res.send( data ); // Send the modified XML data
		} );
	} );

	// Route for handling app connection requests
	app.post( '/connection/:app' , function( req , res ) {
		console.log( "Connecting App " + req.params.app ); // Log the app being connected

		// Set CORS headers for POST requests
		res.setHeader( "Access-Control-Allow-Method" , "POST, OPTIONS" );
		res.setHeader( "Access-Control-Allow-Headers" , "Content-Type" );

		res.type( "json" ); // Set content type to JSON
		// Send JSON response with WebSocket URL and ping interval
		res.send( JSON.stringify( {
			URL: "ws://" + addr + ":8008/session/" + req.params.app + "?1" ,
			pingInterval: 3
		} ) )
	} );

	// Route for listing or redirecting to running apps
	app.get( '/apps' , function( req , res ) {
		// Check for any running applications
		for ( var key in Apps.registered ) {
			if ( Apps.registered[ key ].config.state == "running" ) {
				console.log( "Redirecting to" + key );
				res.redirect( '/apps/' + key ); // Redirect to the running app
				return; // Exit the function after redirecting
			}
		}

		// If no app is running, send a 204 No Content response
		res.setHeader( "Access-Control-Allow-Method" , "GET, POST, DELETE, OPTIONS" );
		res.setHeader( "Access-Control-Expose-Headers" , "Location" );
		res.setHeader( "Content-Length" , "0" );
		res.setHeader( "Content-Type" , "text/html; charset=UTF-8" );
		res.send( 204 , "" ); // Send 204 No Content
	} );
}

/**
 * Sets up SSDP (Simple Service Discovery Protocol) for device discovery.
 * @param {string} addr - The local IP address of the server.
 */
function setupSSDP( addr ) {
	// Event handler for when the SSDP peer is ready
	peer.on( "ready" , function( ) {
		/* No specific action needed on ready for this implementation */
	} );

	// Event handler for receiving SSDP notify messages
	peer.on( "notify" , function( headers , address ) {
		// Currently, this handler does not perform any specific actions.
		// It could be used to track other devices on the network.
	} );

	// Event handler for receiving SSDP search requests
	peer.on( "search" , function( headers , address ) {
		// Check if the search request is for the DIAL service
		if ( headers.ST.indexOf( "dial-multiscreen-org:service:dial:1" ) != -1 ) {
			// Reply to the search request with device information
			peer.reply( {
				LOCATION: "http://" + addr + ":8008/ssdp/device-desc.xml" , // URL for device description
				ST: "urn:dial-multiscreen-org:service:dial:1" , // Service type
				"CONFIGID.UPNP.ORG": 7337 , // UPNP configuration ID
				"BOOTID.UPNP.ORG": 7337 , // UPNP boot ID
				USN: "uuid:" + myUuid // Unique Service Name
			} , address ); // Send the reply to the requesting address
		}
	} );

	// Start the SSDP peer to begin broadcasting and listening
	peer.start( );
}