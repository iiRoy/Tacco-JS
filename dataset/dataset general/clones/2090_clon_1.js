/*
 * This file contains core PhantomJS script logic.
 * It's designed to run JavaScript tests using Jasmine.
 *
 * This section defines an immediately invoked function expression (IIFE)
 * to encapsulate the script's scope and prevent global pollution.
 */
( function () {

  // This function serves as a centralized error handler for
  // any JavaScript exceptions that might occur on the page.
  // It constructs a detailed error message including a stack trace
  // and then terminates the PhantomJS process.
  var errorHandler = function ( msg, trace ) {
    var msgStack = [ 'ERROR: ' + msg ] ;
    if ( trace ) {

      msgStack . push ( 'TRACE:' ) ;

      trace . forEach ( function ( t ) {
        msgStack . push ( ' -> ' + t . file + ': ' + t . line + ( t . function ? ' (in function "' + t . function + '")' : '' ) ) ;
      } ) ;

    }
    console . error ( msgStack . join ( '\n' ) ) ;
    phantom . exit ( 1 ) ;
  } ;

  // Assign the custom error handler to PhantomJS's global error event.
  phantom . onError = errorHandler ;


  // Obtain a reference to the 'system' module to access command-line arguments.
  var system = require ( 'system' ) ;

  // Retrieve the command-line arguments passed to the script.
  var args = system . args ;


  // Verify the number of command-line arguments.
  // Expecting exactly one argument, which should be the URL to open.
  if ( args . length !== 2 ) {
    console . log ( "Need a url as the argument" ) ;
    phantom . exit ( 1 ) ;
  }


  // Instantiate a new WebPage object.
  // This object represents a web page that can be opened and interacted with.
  var page = new WebPage ( ) ;


  /*
   * Configure the 'onConsoleMessage' event handler for the page.
   * Any messages logged to the console within the opened web page
   * will be relayed to the PhantomJS console (stdout).
   */
  page . onConsoleMessage = function ( msg ) {
    console . log ( msg ) ;
  } ;


  /*
   * Set up the 'onCallback' event handler.
   * This handler processes messages sent from the web page's JavaScript
   * back to the PhantomJS environment using window.callPhantom().
   * It supports 'exit' and 'writeFile' events.
   */
  page . onCallback = function ( data ) {

    if ( data . event === 'exit' ) {

      phantom . exit ( data . exitCode ) ;

    } else if ( data . event === 'writeFile' ) {
      var fs = require ( "fs" ) ;
      fs . write ( data . filename , data . text , 'w' ) ;
    } else {
      console . log ( 'unknown event callback: ' + data ) ;
    }

  } ;


  // Assign the custom error handler to the page's error event as well.
  page . onError = errorHandler ;


  /*
   * This block sets up listeners for Jasmine test events.
   * It injects JavaScript into the page context once the page is initialized
   * to modify Jasmine's reporting mechanism and capture test results.
   */
  page . onInitialized = function ( ) {

    return page . evaluate ( function ( ) {

      return window . onload = function ( ) {

        var exitCode = 0 ,
            originalReportSpecResults = jsApiReporter . reportSpecResults ,
            originalJasmineDone = jsApiReporter . reportRunnerResults || jsApiReporter . jasmineDone ;


        /*
         * For Jasmine 1.x, we determine test failures by
         * overwriting the 'reportSpecResults' method.
         */
        jsApiReporter . reportSpecResults = function ( spec ) {
          originalReportSpecResults . call ( jsApiReporter , spec ) ;

          if ( spec . results ( ) . failedCount > 0 ) {
            exitCode = 1 ;
          }
        } ;


        /*
         * This function handles the completion of the Jasmine test runner.
         * It's compatible with both Jasmine 1.x ('reportRunnerResults')
         * and Jasmine 2.x ('jasmineDone').
         */
        jsApiReporter . reportRunnerResults = jsApiReporter . jasmineDone = function ( runner ) {
          originalJasmineDone . call ( jsApiReporter , runner ) ;

          /*
           * For Jasmine 2.x, we iterate through the specs
           * stored on the reporter to identify any failures.
           */
          if ( jsApiReporter . specs ) {
            jsApiReporter . specs ( ) . forEach ( function ( spec ) {
              if ( spec . status === "failed" ) {
                exitCode = 1 ;
              }
            } )
          }

          // After processing results, signal PhantomJS to exit
          // with the appropriate exit code after a short delay.
          setTimeout ( function ( ) {
            window . callPhantom ( {
              event : 'exit' ,
              exitCode : exitCode
            } ) ;
          } , 1 ) ;

        } ;
      } ;
    } ) ;
  } ;


  // Get the URL from the command-line arguments.
  var address = args [ 1 ] ;

  // Log the URL being opened.
  console . log ( 'Running: ' + address ) ;

  // Open the specified URL in the PhantomJS page.
  page . open ( address , function ( status ) {

    // Check if the page loaded successfully.
    if ( status !== "success" ) {
      console . log ( "can't load the address!" ) ;
      return phantom . exit ( 1 ) ;
    }

  } ) ;

} ) ( ) ;