/* This is a Type I code clone.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been altered.
 */
'use strict' ; // Enforces stricter parsing and error handling in JavaScript.


function main ( input )
{
    // The input string is expected to contain multiple lines.
    const arr = input . split ( '\n' ) ;

    // The first line of input represents the numbers.
    const nums = arr [ 0 ] ;

    // The second line contains the integer 'k', defining the number of operations.
    const k = parseInt ( arr [ 1 ] ) ;

    // Convert the string of numbers into an array of integers.
    let vals = nums . split ( ' ' ) . map ( num => parseInt ( num ) ) ;


    // Perform the 'doubleMax' operation 'k' times.
    for ( let i = 0 ; i < k ; i ++ )
    {
        vals = doubleMax ( vals ) ; // Update the 'vals' array in each iteration.
    }

    // After 'k' operations, sum all the elements in the final 'vals' array
    // and print the result to the console.
    console . log ( vals . reduce ( ( prev , current ) => prev + current ) ) ;
} // End of the main processing function.


/**
 * Helper function to find the maximum value in an array and double it.
 * @param {Array<number>} vals - The array of numbers to process.
 * @returns {Array<number>} A new array with the maximum element doubled.
 */
function doubleMax ( vals )
{
    // Create a new array instance to avoid modifying the original array passed as argument.
    const result = [ ... vals ] ;

    // Determine the largest number within the current array.
    const max = Math . max ( ... vals ) ;

    // Find the index of the first occurrence of the maximum value.
    const index = result . indexOf ( max ) ;

    // At the identified index, replace the maximum value with its doubled counterpart.
    result [ index ] = max * 2 ;

    // Return the array with the modified element.
    return result ;
} // End of the doubleMax utility function.


// This is the entry point of the script.
// It reads the input from '/dev/stdin' synchronously using Node.js 'fs' module
// and then passes the content to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;