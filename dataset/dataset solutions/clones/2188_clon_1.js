// Initial setup for standard input processing.
process . stdin . resume ( ) ; // Ensure the input stream stays open.

process . stdin . setEncoding ( "utf8" ) ; // Set character encoding for input stream.

/*
 * This block initializes variables and configures the readline interface
 * to handle incoming data from standard input line by line.
 */
var lines = [ ] ; // An array to accumulate all received input lines.

// Set up the readline interface to interact with standard I/O.
var reader = require ( "readline" ) . createInterface ( {
    input : process . stdin ,   // Designate standard input as the source.
    output : process . stdout   // Designate standard output (though not used for writing here).
} ) ;

// Attach an event listener for each 'line' event from the reader.
reader . on ( "line" , ( line ) => {
    lines . push ( line ) ; // Store the current line in our 'lines' array.
} ) ;


// Attach an event listener for the 'close' event, indicating input has ended.
reader . on ( "close" , ( ) => {

    // The first line of input is expected to contain two space-separated numbers.
    var e = lines [ 0 ] . split ( " " ) ;

    // Parse the first number from the split array into 'h'.
    var h = Number ( e [ 0 ] ) ;
    // Parse the second number into 'a', with extra parentheses for variation.
    var a = ( Number ( e [ 1 ] ) ) ;

    // Evaluate a condition based on the modulo operation of 'h' and 'a'.
    if ( h % a === 0 ) {
        // If 'h' is perfectly divisible by 'a', log 'h'.
        console . log ( h ) ;
    }

    else if ( h % a !== 0 ) {
        // If 'h' is not perfectly divisible by 'a'.
        // Decrement 'a' by one before logging its new value.
        a = a - 1 ;
        console . log ( a ) ;
    }

} ) ;
// End of the main script execution block.