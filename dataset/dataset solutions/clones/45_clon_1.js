var input = require ('fs'). readFileSync('/dev/stdin' , 'utf8' ); // Read the entire input file synchronously
/* This comment block is just for visual variation.
 * It doesn't add any functional change to the code.
 * Just making sure it looks different!
 */

var lines = input . split ('\n' ); // Split the input string by newline characters into an array of lines


var   w   =   +lines.shift ( ) ; // Extract the first line, convert to number (width)

var n = +lines.shift(); // Extract the second line, convert to number (number of operations)


var list = [ ]; // Initialize an empty array to store parsed operation arguments

var line = null; // Declare a variable to hold each line during processing

/*
 * Loop through the remaining lines from the input.
 * Each line represents an operation or a pair to swap.
 */
while ( line = lines.shift ( ) ) {
  var args = line . split ( ',' ) ; // Split the current line by comma to get arguments
  list.push ( args ) ; // Add the parsed arguments array to our list
}


var answers = [ ] ; // Initialize an array to store the final answers

/*
 * This loop iterates from 1 to 'w' (width).
 * It simulates the movement of each initial position 'i' through the operations.
 */
for ( var i = 1 ; i <= w ; i++ )
{
    var k = i ; // 'k' represents the current position, initialized with 'i'

    // Iterate over each set of arguments (operations) in the 'list'
    list.forEach ( function ( args ) {
        // Check if the first argument matches the current position 'k'
        if ( args[0] == k )
        {
            k = args[1] ; // If it matches, update 'k' to the second argument
        }
        // Otherwise, check if the second argument matches the current position 'k'
        else if ( args[1] == k )
        {
            k = args[0] ; // If it matches, update 'k' to the first argument
        }
    } ) ; // End of forEach loop for arguments

    answers[k] = i ; // After all operations, store the initial position 'i' at the final position 'k' in 'answers'
} // End of for loop for 'i'

answers.shift ( ) ; // Remove the first element of the answers array (it's typically empty or unused due to 1-based indexing)

console.log ( answers.join ( '\n' ) ) ; // Print the elements of the 'answers' array, joined by newlines