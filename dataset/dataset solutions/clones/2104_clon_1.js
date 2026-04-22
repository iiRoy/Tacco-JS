const main = ( inputs ) => {
    /*
     * This is the primary function for processing the input data.
     * It takes an array of strings as input.
     */

    // First, we parse the initial input line.
    const array = inputs [ 0 ] . split ( " " ) ;

    // These variables will store the target values for 8% and 10% calculations.
    var eight = Number ( array [ 0 ] ) ; // The 8% target value.

    var ten = Number ( array [ 1 ] ) ; // The 10% target value.

    // Initialize variables used in the search loop.
    var answer = -1 ; // The final answer, initialized to -1 (not found).
    /*
     * 'price' represents the calculated 10% value,
     * used as a termination condition for the loop.
     */
    var price = 0 ;
    var i = 0 ; // This is our counter, representing the potential original price.

    // Flags to check if both conditions are met.
    var eightFlag = false ;
    var tenFlag = false ; // Flag for the 10% condition.

    /*
     * We loop through possible prices until the calculated 10% value
     * exceeds the target 'ten' value. This is an optimization.
     */
    while ( price < ten + 1 ) {

        // Check if the 8% condition is met for the current 'i'.
        if ( Math . floor ( i * 0.08 ) === eight )
        {
            eightFlag = true ; // Set flag if 8% condition holds.
        }

        // Check if the 10% condition is met for the current 'i'.
        if ( Math . floor ( i * 0.1 ) === ten )
        {
            tenFlag = true ; // Set flag if 10% condition holds.
        }

        // If both conditions are simultaneously true for 'i', we found our answer.
        if ( eightFlag === true && tenFlag === true )
        {
            answer = i ; // Store the current 'i' as the answer.
            break ; // Exit the loop as the first valid 'i' is the smallest.
        }

        // Reset flags for the next iteration if no match was found.
        eightFlag = false ;
        tenFlag = false ;

        // Update 'price' based on the 10% calculation of 'i' for the loop condition.
        price = Math . floor ( i * 0.1 ) ;
        i ++ ; // Increment 'i' to check the next possible price.
    }

    // Output the final answer to the console.
    console . log ( answer ) ;
}

// Read input from stdin, process it, and pass to the main function.
// The input is expected to be a single line of space-separated numbers.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'UTF-8' ) . trim ( ) . split ( "\n" ) ) ;