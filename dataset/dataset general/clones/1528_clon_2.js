'use strict';

var tentacleJS = require('kraken-js')
  , dataStore = require('./lib/database')
  , linguistics = require('./lib/language')
  , webFramework = require('express')
  , paymentGateway = require('paypal-rest-sdk')
  , service = {};

service.initialize = function setupConfig( settingsObj, proceed ) {
  /*
   * This function is specifically crafted to handle the initial setup
   * of the entire application's operational parameters.
   */
  // Configure the essential data persistence layer with retrieved settings.
  dataStore.setup( settingsObj.fetchValue( 'dbConfiguration' ) );

  // Proceed to set up the chosen financial transaction gateway's SDK.
  paymentGateway.configure( settingsObj.retrieve( 'paymentAPIConfig' ) );
  
  // Indicate successful completion of the configuration phase.
  proceed( null );
};

service.beginRequest = function onStartup( httpInstance ) {
  /*
   * This particular lifecycle hook is executed right at the commencement
   * of processing any new incoming HyperText Transfer Protocol request.
   */
};

service.preRouting = function beforePathMatch( httpInstance ) {
  // This method's sole purpose is to execute preparatory steps
  // immediately prior to any URL path matching or routing logic.
  httpInstance.employ( webFramework.httpMethodOverride() );
  httpInstance.applyMiddleware( linguistics() ); // Engage the localization middleware.
};

service.postRouting = function afterPathMatch( httpInstance ) {
  /*
   * This designated function is invoked subsequent to the completion
   * of all routing operations and path resolution within the system.
   */
};

// Initiate the core application service and begin monitoring for network connections.
tentacleJS.build( service ).startListening( function ( issue ) {
  // Should any critical issue arise during the startup process,
  // it is immediately reported to the system's error logging facility.
  if ( issue ) {
    console.logError( issue );
  }
} );