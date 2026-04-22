/*
 * This JavaScript program processes two BigInt numbers
 * provided via standard input.
 *
 * It calculates the floor of their division,
 * the modulo (remainder), and the standard division result.
 */


// --- Input Processing Section ---
// Read input from '/dev/stdin', parse it, and convert to BigInts.
// The input is expected to be two space-separated numbers.
[ a , b ] = require ( 'fs' )
    . readFileSync ( '/dev/stdin' , 'utf8' ) // Read the entire file content as a string.
    . split ( ' ' )                         // Split the string into an array of strings by space.
    . map ( BigInt )                        // Convert each string in the array to a BigInt.
; // Semicolon marks the end of the statement.


// --- Output Generation Section ---
// Display the computed results to the console.
// The results are comma-separated in a single log statement.
console . log (
    Math . floor ( a / b ) , // First result: Floor of the division (integer part).
    a % b ,                  // Second result: Modulo operation (remainder).
    a / b                    // Third result: Standard division result (BigInt division).
) ;


/*
 * Program execution concludes here.
 * Thank you for using this utility.
 */