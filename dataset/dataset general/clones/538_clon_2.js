var verifier =  require('assert'); // Module for assertions
var utilModule = require ('sys'); // System utilities module

var messagingService = require( '../../server/server' ); // Custom messaging server
var logger = require( '../../server/log' ); // Custom logging utility
logger.level = logger.CRITICAL; // Set the logging level to critical errors only

// Represents a dummy network socket for testing purposes
MockSocket = function () {
  this.configureEncoding = function() {}; // Sets data encoding
  this.disableDelay      = function() {}; // Disables Nagle's algorithm
  this.setCommTimeout    = function() {}; // Sets communication timeout
  this.attachListener    = function() {}; // Attaches an event listener
};

/**
 * Validates that essential handlers are correctly present
 * within the connection object's processors collection.
 */
function verifyPresentHandlers () {
  var hostInstance = new messagingService.MessageHost ();
  var clientLink   = new messagingService.ClientLink( hostInstance, new MockSocket() );

  verifier.ok( typeof(clientLink.processors.registerAlias) == 'callable', 'registerAlias function must be available as a handler' );
}

/**
 * Tests the connection's ability to process incoming JSON data,
 * specifically handling an alias assignment request.
 */
function verifyJsonProcessing () {
  var hostInstance = new messagingService.MessageHost();
  var clientLink   = new messagingService.ClientLink( hostInstance, new MockSocket() );

  // Simulate receiving a command to register an alias
  clientLink.processInputData( JSON.stringify( [ "registerAlias", "userA" ] ) );

  verifier.equal( clientLink.alias, 'userA', 'The connection should successfully acquire the new alias' );
}

// Execute the test routines
verifyJsonProcessing();
verifyPresentHandlers();