// This is a JavaScript file demonstrating a simple calculation.
// It uses strict mode for better code quality and error handling.
'use strict'; // Enforce strict parsing and execution rules for the entire script.

/**
 * The main function responsible for processing input and performing a specific calculation.
 *
 * @param {Array<string>} x - An array of strings, typically representing lines of input.
 *                            It is expected that the first element contains space-separated numbers.
 */
const main =  ( x )  =>  { // Define the main arrow function, taking 'x' as its parameter.

    // Step 1: Process the raw input.
    // The first element of the input array 'x' is taken (x[0]).
    // This string is then split by spaces (' ') into an array of string numbers.
    // Finally, each string number is converted to an integer using parseInt with a radix of 10.
    // The result overwrites the original 'x' variable.
    x  =  x[ 0 ].split( ' ' ).map(  val  =>  parseInt( val,  10 )  ) ;


    // Step 2: Destructure the processed numbers into individual constants.
    // 'a' gets the first number, 'b' the second, and 'c' the third.
    const  a  =  x[ 0 ] ,    b  =  x[ 1 ] ,    c  =  x[ 2 ] ;


    // Step 3: Perform the conditional calculation and log the result.
    // This is a ternary operation:
    // If the sum of 'b' and 'c' is greater than 'a' (b + c > a),
    // then calculate (b + c - a).
    // Otherwise (if b + c is not greater than a), the result is 0.
    // The final computed value is then printed to the console's standard output.
    console.log(  b  +  c  >  a  ?  b  +  c  -  a  :  0  ) ;

} ; // End of the 'main' function definition.


// This section handles reading input and invoking the main function.
// 1. 'require("fs")' loads the Node.js file system module.
// 2. '.readFileSync("/dev/stdin", "utf8")' reads the entire content of standard input synchronously,
//    decoding it as a UTF-8 string.
// 3. '.split('\n')' splits the read content into an array of strings,
//    where each string represents a line from the input.
// This array of lines is then passed as an argument to the 'main' function.
main(  require( "fs" ).readFileSync( "/dev/stdin",  "utf8" ).split( '\n' )  ) ;

// End of the JavaScript program.