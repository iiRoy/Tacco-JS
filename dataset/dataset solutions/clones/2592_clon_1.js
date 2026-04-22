/*
 * This script processes input lines to compare two strings.
 * It uses Node.js standard input/output streams.
 */

//  Resume the standard input stream, ensuring it's ready to receive data.
process . stdin . resume ( ) ;

// Set the character encoding for the input stream.
process . stdin . setEncoding ( 'utf8' ) ;
//  Declare an array to hold all incoming lines from standard input.
var lines = [ ] ;

// Initialize a readline interface to handle line-by-line input.
var reader = require ( 'readline' ) . createInterface ( {
    input   : process . stdin , // Assign standard input as the source for reading.
    output  : process . stdout // Assign standard output for any prompts (though not used here).
} ) ;

// Attach an event listener for the 'line' event.
// This callback fires every time a new line of input is received.
reader . on ( 'line' , ( line ) => {
    // Push the received line into our 'lines' array.
    lines . push ( line ) ;
} ) ;

// Attach an event listener for the 'close' event.
// This callback fires when the input stream ends (e.g., Ctrl+D is pressed).
reader . on ( 'close' , ( ) => {
    // Enable strict mode for the entire function scope.
    "use strict"

    // Retrieve the first line from the input array and assign it to constant S.
    const S = lines [ 0 ] ;
    // Retrieve the second line from the input array and assign it to constant T.
    const T = lines [ 1 ] ;


    // Initialize a variable to store the count of matching characters.
    var ans = 0 ;
    // Loop through the first three characters of both strings.
    // The loop variable 'i' goes from 0 up to, but not including, 3.
    for ( var i = 0 ; i < 3 ; i ++ ) {
        // Compare the character at index 'i' in string S with the character at index 'i' in string T.
        // If they are equal, the comparison (S[i]==T[i]) evaluates to true (which is 1 in a numeric context).
        // This value is then added to 'ans'.
        ans += S [ i ] == T [ i ] ;
    }

    // Print the final count of matching characters to the console.
    console . log ( ans ) ;
} ) ; // End of the 'close' event handler function.