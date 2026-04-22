/*
 * This JavaScript program reads three numbers from standard input,
 * performs a specific arithmetic calculation, and then prints the result.
 *
 * The input is expected to be three numbers, each on a new line.
 * For example:
 * 10
 * 3
 * 2
 *
 * The calculation performed is (x - a) % b.
 */


// Declare and initialize variables x, a, and b.
// These variables are populated by reading data from standard input.
let [ x, a, b ]  =  require( "fs" )
    .readFileSync( "/dev/stdin" ,  "utf8" ) // Read the content of /dev/stdin as a UTF-8 string.
    .split( "\n" )                          // Split the string into an array of strings using newline as a delimiter.
    .map( Number )                          ; // Convert each element in the resulting array from string to number.


// Perform the specified arithmetic operation: (x minus a) modulo b.
// The final computed value is then output to the console.
console .log( ( x - a )  %  b ) ; // Print the result of the calculation.


// End of the program execution.