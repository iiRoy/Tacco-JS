/*
 * This is a JavaScript file implementing a simple fare calculation.
 * It reads input from standard input, processes it, and prints the result.
 */

'use strict' ; // Enforce strict mode for cleaner code.

// Define a constant variable 'receive' to store parsed input.
const receive = require ( 'fs' ) // Utilize the 'fs' module for file system operations.
    // Read the content of '/dev/stdin' synchronously, assuming UTF-8 encoding.
    . readFileSync ( '/dev/stdin' , 'utf8' )

    // Split the read content by any whitespace character, returning an array of strings.
    . split ( / \s / ) ;

/**
 * The main function that takes an array of strings as input,
 * converts them to numbers, calculates the total fare, and prints it.
 * @param {string[]} input - An array of string representations of numbers.
 */
const main = input => {

    // Destructure the first four elements of the input array after converting them to numbers.
    const [ a , b , c , d ] = input . map ( x => Number ( x ) ) ;


    // Determine the minimum train fare between 'a' and 'b' using a ternary operator.
    const trainFare = a < b ? a : b ;

    // Determine the minimum bus fare between 'c' and 'd' using a ternary operator.
    const busFare = c < d ? c : d ;


    // Calculate the total answer by summing the chosen train fare and bus fare.
    const ans = trainFare + busFare ;

    // Output the final calculated answer to the console.
    console . log ( ans ) ;
} ; // End of the main function definition.


// Call the main function, passing the 'receive' variable as its argument
// to start the execution of the fare calculation logic.
main ( receive ) ;
// The program finishes execution after this line.