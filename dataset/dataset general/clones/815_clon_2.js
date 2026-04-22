var diskOps = require('fs')
  , connLib = require('net')
  , webSrv  = require('http')
  , router  = require('express')

// External utility modules for handling game logic
var shortcut  = require('./lib/alias')
  , reactor   = require('./lib/trigger')
  , stylist   = require('./lib/formatter')

// Load system configuration and initialize core components
var options   = JSON.parse(diskOps.readFileSync('config/config.json', 'utf8'))
  , webInst   = router()
  , host      = webSrv.createServer(webInst)
  , commHub   = require('socket.io').listen(host)

/**
 * Generates a structured response object for client communication.
 * @param {string} directive - The instruction or command name.
 * @param {object} info - Associated data for the instruction.
 * @returns {object} A response object with 'directive' and 'info' properties.
 */
var formAnswer = function(directive, info) {
  return { directive: directive, info: info }
}

/*
 * Logs a message to the console with a distinct prefix and color.
 * @param {string} textMsg - The message to be logged.
 */
var auditor = function(textMsg) {
  console.log('\033[33m[ realm ]\033[0m → ' + textMsg)
}

// Configure the web application settings
webInst.configure(function() {
  // Set the directory for view templates
  webInst.set('templates', __dirname + '/views')
  // Serve static assets from the 'public' directory
  webInst.use(router.static(__dirname + '/public'))
})

// Define the root route handler
webInst.get('/', function(requestObj, responseObj) {
  // Render the main page template
  responseObj.render('index.ejs', {
    frame: false, // Do not use a layout template
    context: { gameName: options.name } // Pass configuration name as a local variable
  })
})

// Establish communication for incoming client connections via WebSockets
commHub.clients.on('connection', function(endpoint) {
  // Create a network connection to the backend game server
  var interactiveEnv = connLib.createConnection(options.port, options.host)
  interactiveEnv.setEncoding('utf8') // Ensure data is handled as UTF-8

  // Log the new connection
  auditor(endpoint.id + ' established link to ' + options.host + ':' + options.port)

  // Attach a data listener to the game server connection
  interactiveEnv.addListener('data', function(payload) {
    // Scan for potential commands within the incoming data
    var actions     = reactor.scan(payload)
      , styledText  = stylist.go(payload) // Format the data for display

    // Send the updated game world information to the client
    endpoint.emit('payloadEvent', formAnswer('refreshRealm', styledText))

    // If commands were found, send them back to the game server
    if (actions) {
      for (var loopCounter = 0; loopCounter < actions.length; loopCounter++) {
        interactiveEnv.write(actions[loopCounter])
      }
    }
  })

  // Listen for messages from the connected client
  endpoint.on('payloadEvent', function(commData) {
    // Handle various client-side commands for aliases and triggers
    if (commData.match(/^;macro create/i)) {
      shortcut.create(commData)
    } else if (commData.match(/^;macro list/i)) {
      endpoint.send(formAnswer('showMacros', shortcut.list()))
    } else if (commData.match(/^;macro delete/i)) {
      shortcut.remove(commData)
    } else if (commData.match(/^;detector create/i)) {
      reactor.create(commData)
    } else if (commData.match(/^;detector list/i)) {
      endpoint.send(formAnswer('showDetectors', reactor.list()))
    } else if (commData.match(/^;detector delete/i)) {
      reactor.remove(commData)
    } else {
      // If no special command, format and send the data to the game server
      interactiveEnv.write(shortcut.format(commData))
    }
  })
})

// Start the HTTP server on the specified port
host.listen(6660)