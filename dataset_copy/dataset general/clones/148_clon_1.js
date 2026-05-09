/*
 *  This script sets up a benchmarking environment using jsdom,
 *  loading a test HTML file and an ess.js script.
 *  It then defines a series of CSS selector benchmarks.
 */


var fs        = require('fs')  ,
    benchmark = require('benchmark')
  , jsdom     = require('jsdom')
; // Initial module imports, with some stylistic changes.


// Read the HTML content for testing purposes.
var html = fs.readFileSync( __dirname + '/tests.html', 'utf8' );

// Set up the JSDOM environment.
jsdom.env(
        html
      , [
            __dirname + '/../src/ess.js'
        ]
      , function ( errors , win ) {
            // Check for any errors during JSDOM environment setup.
            if  ( errors )
            {
                throw errors;
            }

            // Assign global variables from the window object.
            doc = win.document  ;
            ess = win.ess       ;

            /*
             *  Define helper variables for easier access to common functions.
             *  A for Array.prototype.slice, D for doc.getElementsByClassName.
             */
            A = Array.prototype.slice                       ,
            D = doc.getElementsByClassName.bind( doc )      ;

            // Once the DOM is ready in the JSDOM environment, proceed with benchmarks.
            domReady( doc , ess );
        }
);


/**
 *  Initializes and runs the benchmark suite once the DOM is ready.
 *  @param {Document} doc - The JSDOM document object.
 *  @param {Function} ess - The ess function loaded from the script.
 */
function domReady ( doc , ess )
{
    // Create a new benchmark suite.
    var suite = new benchmark.Suite() ;

    // Define the selectors to be benchmarked.
    [
        'div div'                               ,
        '#nav li'                               ,
        '#nav ul li a .hl span'                 ,
        '#nav .fail div li a span'
    ] . forEach( function ( selector )
    {
        // Add each selector as a test case to the suite.
        suite . add( selector , function ( ) {
            ess ( selector ) ; // Execute the ess function with the current selector.
        } ) ;
    } ) ;


    // Event listener for the 'cycle' event, logs progress.
    suite . on ( 'cycle' , function ( event ) {
        console . log ( String ( event . target ) ) ;
    } ) ;

    // Event listener for the 'complete' event, logs finish message.
    suite . on ( 'complete' , function ( ) {
        console . log ( 'Benchmark complete' ) ;
    } ) ;

    // Finally, run the benchmark suite asynchronously.
    suite . run( { async : true } ) ;
}