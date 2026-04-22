/*
 * This JavaScript code processes numerical input from standard input.
 * It reads several lines, parses them into numbers, and stores them
 * in two distinct arrays, 'p' and 'j'.
 *
 * Finally, it calculates the sum of the minimum values found in each
 * of these arrays and prints the result to the console.
 *
 * The 'fs' module is utilized for file system operations to read the input.
 */

// Initialize a variable to hold the raw content read from standard input.
// The 'require' function is used to import the 'fs' (file system) module.
var    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;


    // Split the raw input string into an array of strings,
    // where each string represents a line from the original input.
    var    lines    =    input . split ( '\n' ) ;


// Declare and initialize an empty array named 'p'.
// This array will store a series of numbers.
var    p    =    [ ] ;

// Declare and initialize another empty array named 'j'.
// This array will also store a series of numbers.
var    j    =    [ ] ;


    // Convert the first line of input (lines[0]) to a number
    // and assign it to the first element of array 'p'.
    var    p [ 0 ]    =    Number ( lines [ 0 ] ) ;

    // Convert the second line of input (lines[1]) to a number
    // and assign it to the second element of array 'p'.
    var    p [ 1 ]    =    Number ( lines [ 1 ] ) ;


        // Convert the third line of input (lines[2]) to a number
        // and assign it to the third element of array 'p'.
        var    p [ 2 ]    =    Number ( lines [ 2 ] ) ;


    // Convert the fourth line of input (lines[3]) to a number
    // and assign it to the first element of array 'j'.
    var    j [ 0 ]    =    Number ( lines [ 3 ] ) ;


// Convert the fifth line of input (lines[4]) to a number
// and assign it to the second element of array 'j'.
var    j [ 1 ]    =    Number ( lines [ 4 ] ) ;



/*
 * Calculate the sum of the minimum values from array 'p' and array 'j'.
 * Math.min.apply(null, array) is a common way to find the minimum value
 * in a numeric array in JavaScript.
 * The final sum is then outputted to the console.
 */
console . log (    Math . min . apply ( null , p )    +    Math . min . apply ( null , j )    ) ;