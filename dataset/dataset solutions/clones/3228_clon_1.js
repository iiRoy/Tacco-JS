/*
 * This JavaScript code reads numerical input, performs sorting and difference calculations,
 * and then computes a sum based on the sorted differences.
 * It utilizes the Node.js 'readline' module to handle standard input and output operations.
 * The primary goal is to find the sum of the smallest differences between elements.
 */
var readline = require ( 'readline' ) ; // Imports the built-in 'readline' module for interactive input

var lines = [ ] ; // Declares an empty array to store all incoming lines from standard input

// Creates an interface for reading data line by line from the console
var rl = readline.createInterface ( {
    input  :  process.stdin ,   // Specifies standard input as the source
    output :  process.stdout ,  // Specifies standard output as the destination
} ) ; // End of readline interface configuration object

// Attaches an event listener that triggers every time a new line of input is received
rl.on ( 'line' , function ( x ) {
    // Pushes the received line 'x' into the 'lines' array for later processing
    lines.push ( x ) ;
} ) ; // End of 'line' event handler definition

// Attaches an event listener that triggers once the input stream has ended (e.g., Ctrl+D or EOF)
rl.on ( 'close' , function ( ) {

    // Retrieves the first line of input, which contains 'n' and 'm'
    var tmp = lines.shift ( ) ; // 'shift()' removes the first element from the array and returns it

    // Parses the value of 'n' from the first part of the 'tmp' string
    var n = Number ( tmp.split ( " " ) [ 0 ] ) ;
    // Parses the value of 'm' from the second part of the 'tmp' string
    var m = Number ( tmp.split ( " " ) [ 1 ] ) ;

    var result = 0 ; // Initializes the variable 'result' to store the final computed sum

    // Declares two arrays, 'x' and 'w', both of size 'm'
    var x = Array ( m ) ;
    var w = Array ( m ) ;

    // Processes the second line of input, which contains the elements for array 'x'
    tmp = lines [ 0 ] . split ( " " ) ; // Splits the line by spaces into an array of strings

    // Loop to convert each string element in 'tmp' to a number and assign it to array 'x'
    for ( var i = 0 ; i < m ; i ++ ) {
        x [ i ] = Number ( tmp [ i ] ) ;
    }

    // Sorts the array 'x' in ascending numerical order
    x.sort ( function ( a , b ) {
        return ( a - b ) ; // Standard comparison function for ascending order
    } ) ;


    // Initializes the first element of array 'w' to 0
    w [ 0 ] = 0 ;

    // Loop to calculate the differences between consecutive elements of the sorted array 'x'
    for ( var i = 1 ; i < m ; i ++ ) {
        w [ i ] = x [ i ] - x [ i - 1 ] ; // Stores the difference in 'w'
    }

    // Sorts the array 'w' (containing the differences) in ascending numerical order
    w.sort ( function ( a , b ) {
        return ( a - b ) ; // Standard comparison for ascending order
    } ) ;


    // Calculates the final 'result' by summing the smallest differences from array 'w'
    // The loop iterates up to 'w.length - (n - 1)' elements, effectively excluding the largest 'n-1' differences
    for ( var i = 0 ; i < w.length - ( n - 1 ) ; i ++ ) {
        result = result + w [ i ] ; // Adds the current difference to the 'result'
    }

    // Prints the final calculated 'result' to the standard output console
    console.log ( result ) ;

} ) ; // End of 'close' event handler definition