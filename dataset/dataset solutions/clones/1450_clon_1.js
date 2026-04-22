// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// All identifiers, operators, and expressions remain precisely the same.

var input= require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ; // Read the entire input from standard input.

    /*
     * The input string is now available in the 'input' variable.
     * We will proceed to split it into individual lines.
     */

var lines = input . split ( '\n' ) ;


    // Extract the first line, which represents 'n', and convert it to a number.
    var n = + lines . shift ( ) ;

    // Extract the second line, which represents array 'S', and split it by spaces.
    var S = lines . shift ( ) . split ( ' ' ) ;

    // Extract the third line, which represents 'q', and convert it to a number.
    var q = + lines . shift ( ) ;

    /*
     * Extract the fourth line, which represents array 'T'.
     * Split it by spaces, and then filter it to ensure
     * that only unique values are retained in the array.
     */
    var T = lines . shift ( ) . split ( ' ' ) . filter ( function ( val ,  i ,  self ) {
        return self . indexOf ( val ) == i ;
    } ) ;


// Initialize an empty object, which will serve as a hash map (dictionary)
// to store the presence of elements from array S for efficient lookups.
var dic = [ ] ;

// Iterate through each value in the array 'S'.
S . forEach ( function ( val ) {
    dic [ val ] = true ; // Mark the current value as present in our dictionary.
} ) ;


var cnt = 0 ; // Initialize a counter variable to keep track of common elements.

// Iterate through each unique number in the array 'T'.
T . forEach ( function ( num ) {
    // Check if the current number 'num' exists as a key in our 'dic' object.
    // If it does, it means this number was also present in array 'S'.
    if ( dic [ num ] )
    {
        cnt ++ ; // Increment the counter if the number is found in both S and T.
    }
} ) ;


// Finally, print the total count of common unique elements found to the console.
console . log ( cnt ) ;

// End of the Type I cloned script.