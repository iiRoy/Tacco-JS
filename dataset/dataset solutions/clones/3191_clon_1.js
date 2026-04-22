/*
 * This JavaScript file implements a function to calculate the Greatest Common Divisor (GCD)
 * of a list of numbers provided as input. It uses a modified Euclidean algorithm approach.
 */

// The 'Main' function serves as the entry point for processing the input data.
function Main( input )
{
    /*
     * The 'input' parameter initially holds the entire raw string from standard input.
     * It typically contains multiple lines of data.
     */

    // Step 1: Parse the input string into an array of lines.
    // Each element of the 'input' array will now correspond to one line from the original data.
    input = input . split ( "\n" ) ;

    // Step 2: Extract the value of N from the first line.
    // The first line (input[0]) contains space-separated values, with N being the first.
    tmp0 = input[ 0 ] . split ( " " ) ; // Split the first line by spaces.
    N = Number ( tmp0[ 0 ] ) ;          // Convert the first token to a number and assign to N.

    // Step 3: Parse the array of numbers from the second line.
    // The second line (input[1]) contains the actual numbers, also space-separated.
    A = input[ 1 ] . split ( " " ) ; // Split the second line by spaces to get string representations of numbers.

    // Step 4: Convert all elements in array A from strings to numbers.
    // This loop iterates N times, converting each string element into its numerical equivalent.
    for ( var i = 0 ; i < N ; i++ )
    {
        A[ i ] = Number ( A[ i ] ) ;
    }

    /*
     * Core logic: Calculate the GCD of all numbers in array A.
     * This section employs an iterative approach, similar to the Euclidean algorithm
     * for finding the GCD of multiple numbers simultaneously.
     */

    var zero_cnt = 0 ; // Initialize a counter. This variable tracks how many numbers
                       // in array A have been reduced to the current common divisor candidate.

    // The main loop continues as long as not all numbers in A are equal to the common divisor.
    while ( zero_cnt != N )
    {
        zero_cnt = 0 ; // Reset the counter at the beginning of each iteration of the outer loop.

        // Find the smallest number in the current array A. This will be used as the divisor.
        var min = Math . min ( ...A ) ;

        // Iterate through each number in array A to apply the division and remainder logic.
        for ( var i = 0 ; i < N ; i++ )
        {
            var mod = A[ i ] % min ; // Calculate the remainder of A[i] divided by 'min'.

            if ( mod !== 0 ) // If the remainder is NOT zero:
            {
                A[ i ] = mod ; // The number A[i] is replaced by its remainder.
            }
            else // If the remainder IS zero (A[i] is a multiple of 'min'):
            {
                A[ i ] = min ; // A[i] is replaced by 'min', indicating it has been reduced to this common factor.
                zero_cnt++ ;   // Increment the counter, as this number is now 'aligned' with 'min'.
            }
        }
    }

    // After the 'while' loop terminates, all numbers in array A will be equal to their GCD.
    // Therefore, simply finding the minimum (or any) element will yield the final GCD.
    console . log ( Math . min ( ...A ) ) ;
}


/*
 * Standard input/output handling.
 * This part reads the entire content from /dev/stdin and passes it to the Main function.
 * It is crucial for competitive programming environments and should generally remain untouched.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Optional: A commented-out example call for local testing purposes.
// Main ( "4\n5 13 8 1000000000" ) ;