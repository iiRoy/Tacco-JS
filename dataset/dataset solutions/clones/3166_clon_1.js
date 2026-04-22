/*
 * This script processes input lines to determine a historical era.
 * It primarily checks a single date input to categorize it.
 * The logic is focused on a specific cutoff date for the 'Heisei' era.
 */
var lines = [ ]; // Declare and initialize an array to hold all input lines.

// Initialize the readline interface for standard I/O operations.
// This allows the program to interact with the user via the console.
var  reader = require( 'readline' ) .createInterface( {
    input   :   process.stdin,    // Use standard input stream.
    output  :   process.stdout    // Use standard output stream.
} );

// Attach an event listener for each 'line' event.
// This function executes every time a new line of input is received.
reader.on( 'line' ,   function ( line ) {
    lines .push( line ); // Append the received line to the 'lines' array.
} );

// Attach an event listener for the 'close' event.
// This function runs once the input stream has ended.
reader .on( 'close' , function ( ) {

    // Proceed only if exactly one line of input was provided.
    if  (  lines.length  ===  1  )  {

        // Take the first (and only) input line and remove all '/' characters
        // to form a numeric date representation (e.g., '2019/04/20' becomes '20190420').
        var date_int = lines[ 0 ] .replace(  /\//g  ,  ''  );

        // Compare the processed date integer against a specific cutoff date.
        // The cutoff for 'Heisei' is April 30, 2019.
        if  (  date_int  <=  20190430  )  {
            console.log( 'Heisei' ); // Output 'Heisei' if the date falls within this period.
            return; // Terminate execution here as the condition is met.
        }
    }
    // If the input doesn't match the criteria for 'Heisei' or was not a single line,
    // output 'TBD' (To Be Determined).
    console.log( 'TBD' );
} );