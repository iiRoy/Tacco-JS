/*
 * This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * The core logic and identifiers remain completely unchanged.
 */
"use strict"
; // Enable strict mode for better error handling and cleaner code.


// Define the main function that will process the input argument.
const main = arg =>
{
    // Split the input string by spaces and convert each part into a numerical value.
    let Nums = arg . split ( " " ) . map ( n => Number ( n ) ) ;


    // Extract individual values from the 'Nums' array.
    let member = Nums [ 0 ] ; // Represents the number of members.
    let train = Nums [ 1 ] ;  // Represents the cost per member for the train.
    let taxi = Nums [ 2 ] ;   // Represents the total cost for a taxi.

    // Calculate the minimum cost: either the total train cost or the taxi cost.
    // This is a ternary operation: if (member * train > taxi) then taxi else (member * train).
    let ans = member * train > taxi ? taxi : member * train ;

    // Print the calculated minimum answer to the standard output.
    console . log ( ans ) ;
}


// Read the input from standard input, decode it using UTF-8, and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;