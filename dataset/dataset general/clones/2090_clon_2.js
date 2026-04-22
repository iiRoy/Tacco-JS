( function () { /* Begin self-executing anonymous function to encapsulate scope. */

  /* This routine handles and logs any JavaScript errors encountered during page execution. */
  var handlePageError = function( errorMsg , errorTrace ) {
    var errorDetails = [ 'PROBLEM: ' + errorMsg ]; /* Prepare a list to accumulate error messages. */

    if ( errorTrace ) { // If a stack trace is provided, append it to the details.
      errorDetails.push( 'STACK:' );
      errorTrace.forEach( function ( frame ) {
        errorDetails.push( ' -> ' + frame.file + ':' + frame.line + ( frame.function ? ' (in function "' + frame.function + '")' : '' ) );
      } ) ;
    }

    console.error( errorDetails.join( '\n' ) ) ; // Output the complete error report to the console.
    phantom.exit( 1 ); /* Terminate the PhantomJS process with a failure status. */
  } ;
  phantom.onError = handlePageError; /* Register our custom error handler with PhantomJS's global error event. */

  var systemModule = require( 'system' ); // Obtain the 'system' module for runtime environment access.
  var commandArgs = systemModule.args; // Retrieve the command-line arguments array.

  if ( commandArgs.length !== 2 ) { // Validate that exactly one URL argument is supplied.
    console.log( "Expected a URL argument for script execution." ) ;
    phantom.exit( 1 ) ; // Exit if the argument count is incorrect.
  }

  var browserInstance = new WebPage(); // Instantiate a new virtual web page object.

  /* Redirect console messages from the web page to the parent PhantomJS console. */
  browserInstance.onConsoleMessage = function ( outputMsg ) {
    console.log( outputMsg ) ;
  } ;

  /* Define a handler for custom callbacks originating from the injected page script. */
  browserInstance.onCallback = function( callbackData ) {
    if ( callbackData.type === 'terminate' ) { // Process a request to exit the PhantomJS process.
      phantom.exit( callbackData.code ); // Exit using the provided completion code.
    }
    else if ( callbackData.type === 'saveFile' ) { // Handle a request to write data to a file.
      var fileUtil = require( "fs" ); // Load the file system module.
      fileUtil.write( callbackData.path, callbackData.content, 'w' ); // Perform the file write operation.
    }
    else {
      console.log( 'Unrecognized callback event type: ' + callbackData.type ); // Log any unknown callback types.
    }
  } ;

  /* Attach the general error handler to the specific page error event. */
  browserInstance.onError = handlePageError;

  /* Set up event listeners and overrides for the Jasmine testing framework upon page initialization. */
  browserInstance.onInitialized = function () {
    return browserInstance.evaluate( function () {
      return window.onload = function() { // This block executes once the DOM is fully loaded.
        var finalExitCode = 0, // Variable to store the ultimate exit code for the test run.
            originalSpecResultHandler = jsApiReporter.reportSpecResults, // Backup the default spec result handler.
            originalRunnerCompletion = jsApiReporter.reportRunnerResults || jsApiReporter.jasmineDone; // Backup the runner completion handler (Jasmine 1.x or 2.x).

        // For Jasmine 1.x: Intercept spec results to detect any test failures.
        jsApiReporter.reportSpecResults = function ( specItem ) {
          originalSpecResultHandler.call( jsApiReporter, specItem ); // Call the stored original handler first.
          if ( specItem.results().failedCount > 0 ) { // Check if the current test spec reported failures.
            finalExitCode = 1; // Mark the overall run as failed.
          }
        };

        // For Jasmine 1.x and 2.x: Override the final test runner completion method.
        jsApiReporter.reportRunnerResults = jsApiReporter.jasmineDone = function ( testRunner ) {
          originalRunnerCompletion.call( jsApiReporter, testRunner ); // Execute the original completion logic.

          // For Jasmine 2.x: Iterate through all collected specs to find any failed ones.
          if ( jsApiReporter.specs ) {
            jsApiReporter.specs().forEach( function ( individualSpec ) {
              if ( individualSpec.status === "failed" ) { // If a spec's status is 'failed'.
                finalExitCode = 1; // Indicate a test failure.
              }
            } ) ;
          }

          // Introduce a slight delay before triggering the PhantomJS exit callback.
          setTimeout( function () {
            window.callPhantom( { // Send a message back to the PhantomJS environment.
              type: 'terminate', // Signal the intent to terminate.
              code: finalExitCode // Pass the determined exit status.
            } ) ;
          }, 1 ) ; // A minimal timeout to ensure event loop clears.
        } ;
      } ;
    } ) ;
  } ;

  var targetAddress = commandArgs[ 1 ]; // Retrieve the target URL from the command-line arguments.
  console.log( 'Attempting to load: ' + targetAddress ); // Inform the user about the URL being opened.
  browserInstance.open( targetAddress, function( loadOutcome ) { // Open the URL in the virtual browser instance.
    if ( loadOutcome !== "success" ) { // Check if the page failed to load.
      console.log( "Failed to load the requested web address!" ) ;
      return phantom.exit( 1 ) ; // Exit with an error if loading was unsuccessful.
    }
  } ) ;

} ) ( ) ; /* End of the self-executing function. */