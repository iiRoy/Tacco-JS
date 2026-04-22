process . stdin . resume ( ) ;
/*
 * This script is designed to read input from the standard input stream.
 * It uses Node.js's built-in `process.stdin` object.
 */

process . stdin . setEncoding ( 'utf8' ) ; // Sets the character encoding for stdin to UTF-8.


var lines = [ ] ; // An array to store each line read from stdin.


// Import the 'readline' module to handle line-by-line input parsing.
var reader = require ( 'readline' ) . createInterface ( {
    input : process . stdin , // Specifies stdin as the input source for the readline interface.
    output : process . stdout // Specifies stdout as the output source (though not directly used for printing here).
} ) ;


// Event handler for each line received from standard input.
reader . on ( 'line' , ( line ) => {
    lines . push ( line ) ; // Add the current line to our collection of lines.
} ) ;


// Event handler for when the standard input stream is closed (e.g., EOF is reached).
reader . on ( 'close' , ( ) => {

    /*
     * Main logic begins here once all input has been received.
     * The script processes two lines of input.
     */

    // First line: Contains three space-separated numbers N, A, and B.
    // N: Total number of items (not directly used in the eligibility logic).
    // A: Maximum number of 'a' items that can be selected.
    // B: Maximum number of 'b' items that can be selected.
    // The `map(v=>v-0)` converts string numbers to actual numeric types.
    const [ N , A , B ] = lines [ 0 ] . split ( " " ) . map ( v => v - 0 ) ;


    // Second line: A string of characters, which is split into an array of individual characters.
    const list = lines [ 1 ] . split ( "" ) ;


    // Initialize a boolean array 'map' to store eligibility status for each item.
    const map = [ ] ;


    // 'go' tracks the total count of eligible items (both 'a' and 'b').
    let go = 0 ;


    // 'go2' specifically tracks the count of eligible 'b' items.
    let go2 = 0 ;


    /*
     * Iterate over each character in the 'list' array.
     * 'v' is the current character, 'i' is its index.
     */
    list . forEach ( ( v , i ) => {

        map [ i ] = false ; // By default, assume the current item is not eligible.


        // Check if the total number of eligible items has not yet reached the combined limit (A + B).
        if ( go < A + B ) {

            // If the current character is 'a'.
            if ( v === "a" ) {
                go ++ ; // Increment the total eligible count.
                map [ i ] = true ; // Mark this 'a' item as eligible.
            }
            // Else if the current character is 'b' AND the limit for 'b' items (B) has not been reached.
            else if ( v === "b" && go2 < B ) {
                go ++ ; // Increment the total eligible count.
                go2 ++ ; // Increment the eligible 'b' count.
                map [ i ] = true ; // Mark this 'b' item as eligible.
            }

            // If the character is neither 'a' nor 'b', or if 'b' capacity is full, it remains false.
        }
    } ) ;


    // Convert the boolean 'map' array into an array of "Yes" or "No" strings.
    // Then, join these strings with newline characters to produce the final output.
    console . log ( map . map ( v => v ? "Yes" : "No" ) . join ( "\n" ) ) ;

} ) ; // End of the 'close' event handler.