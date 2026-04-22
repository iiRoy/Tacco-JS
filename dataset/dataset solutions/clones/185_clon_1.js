// This script reads numerical data from standard input,
// sorts it in descending order, and then calculates the
// difference between the largest and smallest numbers,
// finally printing the result formatted to two decimal places.

// Declare a variable 'x' to store the processed input.
x = require( 'fs' ) // Import the Node.js file system module.
    . readFileSync( '/dev/stdin', 'utf8' ) // Read the entire file content from standard input synchronously,
                                        // interpreting it as UTF-8 encoded text.
    . split( "\n" ) ; // Split the read content into an array of strings,
                     // using the newline character as a delimiter.
                     // Each element in 'x' will be a line from the input.


// Sort the array 'x' in descending numerical order.
x. sort(
    function ( a , b ) { // Define an anonymous comparison function for sorting.
        // This function compares two elements, 'a' and 'b'.
        // Returning 'b - a' sorts the array in descending order.
        // If 'a' and 'b' are strings, parseFloat will be implicitly called by subtraction.
        return b - a ;
    }
) ; // End of the sort method call.


// Calculate the difference between the largest and smallest numbers,
// and then print the result to the console.
console . log(
    ( // Start of the expression to be logged.
        parseFloat( x[ 0 ] ) // Convert the first element (which is the largest after sorting) to a floating-point number.
        - // Subtraction operator.
        parseFloat( x[ x. length - 1 ] ) // Convert the last element (which is the smallest after sorting) to a floating-point number.
    ) . toFixed( 2 ) // Format the calculated difference to exactly two decimal places, returning a string.
) ; // End of the console.log call.