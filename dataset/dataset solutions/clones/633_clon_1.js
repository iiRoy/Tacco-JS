/*
 * This JavaScript code reads input from /dev/stdin, processes it,
 * and then prints a formatted output to the console.
 *
 * It's designed to solve a specific type of grid-based problem,
 * likely related to calculating distances or states within a row.
 */

// Import the 'fs' (file system) module to handle file operations.
var input = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Trim any leading/trailing whitespace from the input and split it into an array
// of lines based on the newline character.
var Arr = input . trim() . split ( "\n" ) ;


// The first line of the input (yx) is shifted off the array.
// Its content is not used further in this particular logic, but it's consumed.
var yx = Arr . shift ( ) ;


// Initialize an empty array named 'ans' which will store the processed results.
var ans = [ ] ;


// Iterate over each remaining line (v) in the 'Arr' array, along with its index.
Arr . forEach (  function ( v ,  index )
{
    // Initialize a new empty array for the current row in 'ans'.
    ans [ index ] = [ ] ;

    // Split the current line 'v' into an array of individual characters.
    var arr = v . split ( "" ) ;

    // Initialize a temporary counter 't' to -1.
    // This variable will track the "distance" from the last 'c' character.
    var t = -1 ;

    // Loop through each character in the 'arr' (current line).
    for ( var i = 0 ;  i < arr . length ;  i ++ )
    {
        // Check if the current character is 'c'.
        if ( arr [ i ] == "c" )
        {
            // If it's 'c', push 0 to the current row in 'ans' (distance is 0).
            ans [ index ] . push ( 0 ) ;

            // Reset the temporary counter 't' to 1, as we just passed a 'c'.
            t = 1 ;
        }
        // If the character is '.' AND 't' is still -1 (meaning no 'c' has been encountered yet in this row).
        else if ( arr [ i ] == "."  &&  t == -1 )
        {
            // Push -1 to 'ans' (indicating no 'c' found yet for this position).
            ans [ index ] . push ( t ) ;
        }
        // If the character is '.' AND 't' is not -1 (meaning a 'c' was found previously).
        else if ( arr [ i ] == "."  &&  t != -1 )
        {
            // Push the current value of 't' to 'ans' (this is the distance from the last 'c').
            ans [ index ] . push ( t ) ;

            // Increment 't' for the next character, as the distance increases.
            t ++ ;
        }
    } // End of the inner for loop iterating through characters.

} ) ; // End of the forEach loop iterating through lines.


// Finally, print the 'ans' array to the console.
// First, join the inner arrays with a newline character to form rows.
// Then, replace all commas (which would separate elements in an inner array) with spaces.
console . log ( ans . join ( "\n" ) . replace ( /\,/g , " " ) ) ;

// End of the program.