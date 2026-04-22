"use strict"; /* This directive enforces strict mode for the entire script. */


const main = arg => { // Defines the main function that processes the input argument.
    // First, clean up the input argument: trim whitespace and split into lines.
    arg = arg . trim ( ) . split ( "\n" ) ;
    
    // Extract N, the number of entries, from the first line of input.
    const N = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;
    // Extract K, the target amount, from the first line of input.
    const K = parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;


    /*
     * Process the remaining lines of input.
     * Slice the array from the second element up to N elements.
     * Each line is split by space, and then each part is converted to an integer.
     */
    const AB = arg . slice ( 1 , N + 1 ) . map ( n => n . split ( " " ) . map ( l => parseInt ( l ) ) ) ;

    // Initialize an array to store processed data, starting with the first entry.
    let array = [ { num : AB [ 0 ] [ 0 ] , amount : AB [ 0 ] [ 1 ] , totalAmount : AB [ 0 ] [ 1 ] } ] ;
    // Initialize totalAmount with the amount from the first entry.
    let totalAmount = AB [ 0 ] [ 1 ] ;


    // Loop through the remaining entries from the second one (index 1) up to N-1.
    for ( let i = 1 ; i < N ; i ++ ) {
        // Accumulate the total amount.
        totalAmount += AB [ i ] [ 1 ] ;
        // Create a temporary object for the current entry, including the running total.
        let temp = { num : AB [ i ] [ 0 ] , amount : AB [ i ] [ 1 ] , totalAmount : totalAmount } ;

        // Add the temporary object to the main array.
        array . push ( temp ) ;

    } /* End of the loop for processing AB entries. */

    // console . log ( JSON . stringify ( array ) ) ; // Debugging line, commented out.


    // Iterate through the array of processed entries.
    for ( let i in array ) {
        // Check if the cumulative total amount for the current entry meets or exceeds K.
        if ( array [ i ] . totalAmount >= K ) {
            // If the condition is met, log the current array element (for debugging/output confirmation).
            console . log ( JSON . stringify ( array [ i ] ) ) ;
            // Calculate the answer: if the previous total was less than K, use the current num; otherwise, use the previous num.
            const answer = array [ i ] . totalAmount - array [ i ] . amount < K ? array [ i ] . num : array [ i - 1 ] . num ;
            // Log the final calculated answer.
            console . log ( answer ) ;
            return ; // Exit the function as the target has been found.
        }
    } /* End of the loop searching for K. */

    // If no entry in the loop met the condition, this line will be reached (should not happen in typical problem scenarios).
    console . log ( JSON . stringify ( array ) ) ;
} /* End of the main function definition. */

/*
 * This line reads input from standard input (/dev/stdin)
 * using Node.js's file system module and passes it to the main function.
 * The input is read as UTF-8 encoded text.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;