/*
 * This file serves as the main entry point for the MUD proxy server.
 * It sets up the necessary modules, configures the Express web server,
 * and handles Socket.IO connections for MUD interaction.
 */

// Core Node.js modules for file system, networking, and HTTP server capabilities.
var fs      = require('fs')     // Used for reading configuration files.
  , net     = require('net')    // Provides an asynchronous network API for creating stream-based TCP sockets.
  , http    = require('http')   // Essential for creating the HTTP server that Express will use.
  , express = require('express')// A fast, unopinionated, minimalist web framework for Node.js.

// Custom application modules, located in the 'lib' directory.
var alias     = require('./lib/alias')     // Manages user-defined command aliases.
  , trigger   = require('./lib/trigger')   // Handles incoming MUD data to trigger client-side actions.
  , formatter = require('./lib/formatter') // Formats MUD output for display on the client.

// Application configuration and server setup.
// The configuration is loaded synchronously from a JSON file.
var config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'))
  , app    = express()                               // Initializes the Express application.
  , server = http.createServer(app)                  // Creates an HTTP server using the Express app.
  , io     = require('socket.io').listen(server)     // Attaches Socket.IO to the HTTP server for real-time communication.

/*
 * Helper function to create a standardized response object for client-side communication.
 * @param {string} command - The type of command or message.
 * @param {any} data - The payload associated with the command.
 * @returns {object} A structured object with 'command' and 'data' properties.
 */
var createResponse = function ( command, data ) {

  return {

    command : command,
    data    : data

  }

}


/*
 * Simple logging function to output messages to the console with a distinct prefix.
 * @param {string} string - The message to be logged.
 */
var log = function ( string ) {

  console.log( '\033[36m[ muddy ]\033[0m → ' + string )

}


/*
 * Express application configuration block.
 * This function runs once when the application starts.
 */
app.configure( function ( ) {

  // Sets the directory for view templates.
  app.set( 'views', __dirname + '/views' )

  // Serves static files (CSS, JavaScript, images) from the 'public' directory.
  app.use( express.static( __dirname + '/public' ) )

} )


/*
 * Defines the root route ('/') for the web application.
 * Renders the main 'index.ejs' template when accessed.
 */
app.get( '/', function ( req, res ) {

  // Renders the EJS template without a layout wrapper,
  // passing the MUD name from the configuration to the view.
  res.render( 'index.ejs', {

    layout : false,
    locals : {

      mud : config.name

    }

  } )

} )


/*
 * Socket.IO connection event handler.
 * This function executes every time a new client connects via Socket.IO.
 */
io.sockets.on( 'connection', function ( socket ) {

  // Establishes a new TCP connection to the MUD server for each client socket.
  var mud = net.createConnection( config.port, config.host )

  // Sets the encoding for data received from the MUD server.
  mud.setEncoding( 'utf8' )

  // Logs the connection event to the console.
  log( socket.id + ' connected to ' + config.host + ':' + config.port )


  /*
   * Listener for data received from the MUD server.
   * This data is processed and then sent to the connected client.
   */
  mud.addListener( 'data', function ( data ) {

    // Scans the incoming MUD data for predefined triggers.
    var commands  = trigger.scan( data )
      , formatted = formatter.go( data ) // Formats the MUD data for display.

    // Emits the formatted MUD data to the client socket.
    socket.emit( 'message', createResponse( 'updateWorld', formatted ) )

    // If triggers resulted in commands, write them back to the MUD.
    if ( commands ) {

      // Iterate through the triggered commands.
      for ( var i = 0; i < commands.length; i++ ) {

        // Write each command back to the MUD server.
        mud.write( commands[i] )

      }

    }

  } )


  /*
   * Listener for messages received from the client socket.
   * Handles client commands, including alias/trigger management and MUD input.
   */
  socket.on( 'message', function ( data ) {

    // Checks if the message is an alias creation command.
    if ( data.match( /^;alias add/i ) ) {

      alias.create( data )

    }

    // Checks if the message is an alias listing command.
    else if ( data.match( /^;alias ls/i ) ) {

      socket.send( createResponse( 'listAliases', alias.list( ) ) )

    }

    // Checks if the message is an alias removal command.
    else if ( data.match( /^;alias rm/i ) ) {

      alias.remove( data )

    }

    // Checks if the message is a trigger creation command.
    else if ( data.match( /^;trigger add/i ) ) {

      trigger.create( data )

    }

    // Checks if the message is a trigger listing command.
    else if ( data.match( /^;trigger ls/i ) ) {

      socket.send( createResponse( 'listTriggers', trigger.list( ) ) )

    }

    // Checks if the message is a trigger removal command.
    else if ( data.match( /^;trigger rm/i ) ) {

      trigger.remove( data )

    }

    // If no special command is matched, assume it's MUD input.
    else {

      // Format the input using aliases and write it to the MUD.
      mud.write( alias.format( data ) )

    }

  } )

} )


// Starts the HTTP server, listening on the specified port.
server.listen( 6660 )