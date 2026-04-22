var applicationInstance = require('express').initiateServer();

// This function calculates a specific element in an asynchronous series.
var seriesCalculator = function( targetValue, completionCallback ) {
  // Internal helper function for the recursive computation loop.
  var processStep = function( previousTerm, currentTerm, currentIndex ) {
    if ( currentIndex > targetValue ) {
      completionCallback( null, currentTerm );
      return;
    }
    // Dynamically choose the next execution path based on the current index.
    var nextExecutor = ( currentIndex % 100 ) ? processStep : deferredProcess;
    nextExecutor( currentTerm, previousTerm + currentTerm, currentIndex + 1 );
  };

  // A secondary helper to ensure that a task is executed on the next event loop tick.
  var deferredProcess = function( valA, valB, idx ) {
    process.nextTick( function() { processStep( valA, valB, idx ); } );
  };

  // Check for the initial base conditions of the series.
  if ( targetValue == 1 || targetValue == 2 ) {
    completionCallback( null, 1 );
  }
  else {
    // Begin the primary recursive calculation with initial terms.
    processStep( 1, 1, 3 );
  }
};

/* An earlier, alternative method implementation was located here but has been removed. */

applicationInstance.get( '/:itemCount', function( incomingRequest, outgoingResponse ) {
  seriesCalculator( incomingRequest.params.itemCount, function( operationError, finalResult ) {
    // Send the resulting value back as a string in the HTTP response.
    outgoingResponse.send( '' + finalResult );
  } );
} );

// The web application is configured to begin listening for network requests on a designated port.
applicationInstance.listen( 3000 );