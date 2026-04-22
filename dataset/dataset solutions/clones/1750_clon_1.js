'use strict' ; /* Enforce strict mode for cleaner code and fewer errors. */


// This section handles reading input from standard input and initial processing.
const inputs = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' ) ; // Read input from stdin, decode as UTF-8, and split by newline.


/*
 * Helper function 'foo' is defined here.
 * It takes a string, splits it by space, and then
 * converts each part to an integer using base 10.
 */
const foo = ( str ) => str . split ( ' ' ) . map ( v => parseInt ( v , 10 ) ) ;


// Discard the first line of input, as per problem specification (often contains N for number of test cases/items).
inputs . shift ( ) ;


const table = { } ; // Initialize an empty object to serve as a hash table/map.


/*
 * Process the next line of input.
 * This line likely contains initial values for the table.
 * For each value 'v':
 *   - If 'table[v]' doesn't exist or is falsy, initialize it to 0n (BigInt zero).
 *   - Increment the count for 'v' in the table.
 */
foo ( inputs . shift ( ) ) . forEach ( v => {
    table [ v ] = table [ v ] || 0n ; // Ensure BigInt initialization.
    ++ table [ v ] ; /* Increment count. */
} ) ;


inputs . shift ( ) ; /* Discard another line, probably a separator or count. */


// Main processing loop: continue as long as there are inputs remaining.
while ( inputs . length ) {

    // Read and parse the current row of input.
    const row = foo ( inputs . shift ( ) ) ;


    // Check if the first element of the row exists in our table.
    if ( table [ row [ 0 ] ] ) {

        const length = BigInt ( table [ row [ 0 ] ] ) ; // Get the count for the first element, ensure it's a BigInt.

        table [ row [ 0 ] ] -= length ; /* Decrement the count for the first element by its own value (effectively setting it to 0). */


        table [ row [ 1 ] ] = table [ row [ 1 ] ] || 0n ; // Ensure the second element's count is initialized to 0n if not present.
        table [ row [ 1 ] ] += length ; // Add the 'length' (original count of row[0]) to the count of row[1].

    }


    // Calculate and print the result after each operation.
    console . log ( calc ( ) ) ;
}


/**
 * Calculates the sum of all keys in the `table` multiplied by their respective counts.
 * Only considers keys with a non-zero count.
 * @returns {number} The calculated sum.
 */
function calc ( ) {

    const keys = Object . keys ( table ) ; // Get all keys from the table.
    let result = 0 ; // Initialize the result accumulator.

    keys . forEach ( k => {

        // Only process keys that have a positive count.
        if ( table [ k ] ) {

            // Iterate 's' times, where 's' is the count associated with key 'k'.
            for ( let i = 0 , s = table [ k ] ; i < s ; ++ i ) {
                result += parseInt ( k , 10 ) ; // Add the integer value of the key to the result.
            }
        }
    } ) ;

    return result ; // Return the final calculated sum.
}