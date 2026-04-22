/*
 * This section handles the setup for reading input from the standard input.
 * It utilizes the 'readline' module to create an interface for processing
 * incoming data line by line from the standard input stream.
 */
var reader = require ( 'readline' ) . createInterface ( {
    input   :   process . stdin  ,   // Specifies standard input as the source.
    output  :   process . stdout   // Specifies standard output for any internal prompts (though not directly used here).
} ) ;

/*
 * This array is designated to store each individual line read from the
 * input stream. As lines are received, they are appended to this collection.
 */
var lines   =   [ ] ;

// Registers an event listener for the 'line' event on the reader interface.
// Each time a new line of input is detected, the provided callback function is executed.
reader . on ( 'line' , function ( line ) {

    lines . push ( line ) ; // Appends the newly read line to the 'lines' array.

} ) ;


/*
 * Function: pf( n )
 * -----------------------------------------------------------------------------
 * Description:
 *   Calculates and returns the prime factorization of a given positive integer 'n'.
 *   The result is an array containing the prime factors, including duplicates
 *   if a prime factor appears multiple times (e.g., pf(12) returns [2, 2, 3]).
 *
 * Parameters:
 *   n - A positive integer (Number type) for which to find the prime factors.
 *
 * Returns:
 *   An array of numbers, where each number is a prime factor of 'n'.
 *   If the input 'n' is 1, it returns an array containing only [1].
 */
function pf ( n ) {

    var result  =   [ ] ; // Initialize an empty array to store the prime factors.

    // Base case: If the number is 1, its prime factorization is conventionally considered [1].
    if ( n   ===   1 ) {

        return [ 1 ] ;

    }

    /*
     * 'init' tracks the starting point for checking divisors.
     * It's initialized to 2, the smallest prime number.
     * This optimization helps avoid re-checking smaller numbers once a factor has been found.
     */
    var init    =   2 ;

    // The main loop continues as long as 'n' has not been reduced to 1.
    // This indicates that there are still factors to be found.
    while ( n   !==   1 ) {

        // 'i' is the current potential divisor being tested against 'n'.
        // It starts from 'init' for each new iteration of the outer loop.
        var i   =   init ;

        // The inner loop searches for the smallest prime factor of the current 'n'.
        // It iterates up to Number.MAX_SAFE_INTEGER to prevent infinite loops for very large 'n'
        // if a factor is not found (though for practical purposes, 'n' will reduce).
        while ( i   <   Number . MAX_SAFE_INTEGER ) {

            // Check if 'i' perfectly divides 'n' (i.e., 'i' is a factor).
            if ( n   %   i   ==  0 ) {

                result . push ( i ) ; // If 'i' is a factor, add it to our list of results.

                n   /=  i ; // Divide 'n' by 'i' to reduce 'n' and continue factoring the quotient.

                break ; // Found a factor, so break the inner loop to re-evaluate 'n' with the same 'init'.

            }

            i ++ ; // Increment 'i' to check the next potential divisor.

        }

        // Update 'init' to the last factor 'i' that was successfully used.
        // This ensures that we only check divisors greater than or equal to the last found factor,
        // which is an optimization for prime factorization.
        init    =   i ;

    }

    return result ; // Return the complete array of prime factors.

}


/*
 * Main execution block of the program.
 * -----------------------------------------------------------------------------
 * This code segment is triggered when the 'close' event is emitted by the
 * 'reader' interface, signifying that all input lines have been successfully
 * read from the standard input stream.
 */
reader . on ( 'close' , function ( ) {

    /*
	var s = Number(lines[0]);
	var x = 1;
	while(s%x != 0 || s/x >= 1000000000) x++;
	console.log("0 0 "+x+" 0 0 "+(s/x));
/* */

    // Convert the first line of input (at index 0) to a numerical value 's'.
    var s   =   Number ( lines [ 0 ] ) ;

    // Obtain the prime factorization of 's' using the 'pf' function.
    // The result 'n' will be an array of prime factors.
    var n   =   pf ( s ) ;

    // Initialize an index 'i' for iterating through the prime factors array 'n'.
    var i   =   0 ;

    // Initialize 'w' to 1. This variable will accumulate a product of factors from 'n'.
    var w   =   1 ;

    // This loop attempts to build 'w' by multiplying factors from 'n' (starting from the largest)
    // such that 'w' remains just under 1,000,000,000.
    while ( w   <   1000000000 ) {

        // Multiply 'w' by a factor from 'n'. The factors are taken from the end
        // of the 'n' array (effectively largest factors first) by using `n.length - 1 - i`.
        w   =   w   *   n [ n . length   -   1   -   i ] ;

        // Increment the index 'i' to move to the next factor in the reverse order.
        i ++ ;

    }

    // After the loop, 'w' has likely exceeded 1,000,000,000 because of the last multiplication.
    // This step divides 'w' by the last factor that caused it to exceed the limit.
    // `n.length - i` correctly points to that last factor that was multiplied in.
    w   =   w   /   n [ n . length   -   i ] ;

    // Output the final result to the console in the specified format:
    // "0 0 " followed by the calculated 'w', then " 0 0 ", and finally the quotient of 's' divided by 'w'.
    console . log ( "0 0 "   +   w   +   " 0 0 "   +   ( s   /   w ) ) ;

} ) ;