/*
 * This script processes input lines to calculate distances to the nearest 'c'.
 * It reads from standard input, processes each line, and prints the result.
 */

// Import the 'fs' module for file system operations.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the raw input: trim whitespace and split into an array of lines.
var Arr = input . trim ( ) . split ( "\n" ) ;

// Remove the first element from the array (often a header or count in competitive programming).
Arr . shift ( ) ;

/*
 * Iterate over each line (value 'v') in the processed array.
 * For each line, calculate the distance to the nearest 'c' for each character.
 */
Arr . forEach ( function ( v ) {

    // Initialize an array to store the calculated distances.
    var ans = [ ] ;

    // Convert the current line string into an array of characters.
    var arr = v . split ( "" ) ;

    // Initialize 't' (timer/counter) to -1, indicating no 'c' has been encountered yet.
    var t = -1 ;

    // Loop through each character in the current line's character array.
    for ( var i = 0 ; i < arr . length ; i ++ ) {

        // If the current character is 'c', reset the counter 't' to 0.
        if ( arr [ i ] == "c" ) {
            t = 0 ;
        }

        // Push the current value of 't' (distance to 'c') into the answer array.
        ans . push ( t ) ;

        // If 't' is not -1 (meaning a 'c' has been seen), increment it for the next character.
        if ( t != -1 ) {
            t ++ ;
        }
    }

    // Join the calculated distances with spaces and print the result to the console.
    console . log ( ans . join ( " " ) ) ;

} ) ; // End of Array.forEach loop.