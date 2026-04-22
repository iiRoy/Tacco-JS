/*
 * This JavaScript code defines a function 'main' that solves a combinatorial problem.
 * It reads input from standard input, processes it, and prints the result to the console.
 */
function main(s) // Main function definition, taking 's' as input.
{

    // The input string 's' is first split by newline characters.
    // Each resulting substring is then converted to a Number.
    // This creates an array of numbers from the input.
    s = s . split ( "\n" ) . map ( x => Number ( x ) ) ;

    // Initialize a counter 'p' to 0. This variable will store the final count.
    p = 0 ;


    // Outer loop: iterates through possible values for 'i'.
    // The upper bound for 'i' is determined by the minimum of s[0] and s[3]/500.
    for ( i = 0 ; i <= Math . min ( s [ 0 ] , s [ 3 ] / 500 ) ; i ++ )
    {
        /*
         * Inner loop: iterates through possible values for 'j'.
         * The upper bound for 'j' depends on s[1] and the remaining value after
         * accounting for 'i' (s[3] - 500*i), divided by 100.
         */
        for ( j = 0 ; j <= Math . min ( s [ 1 ] , ( s [ 3 ] - 500 * i ) / 100 ) ; j ++ )
        {
            // Check two conditions for the current combination of 'i' and 'j':
            // 1. The remaining value (s[3] - 500*i - 100*j) must be divisible by 50.
            // 2. The remaining value divided by 50 must be less than or equal to s[2].
            if ( ( ( s [ 3 ] - 500 * i - 100 * j ) % 50 === 0 ) && ( ( s [ 3 ] - 500 * i - 100 * j ) / 50 <= s [ 2 ] ) )
            {
                // If both conditions are met, increment the counter 'p'.
                p ++ ;
            }
            ; // An empty statement, perfectly valid in JavaScript.
        }
    }


    // After all iterations, print the final count 'p' to the console.
    console . log ( p ) ;

} // End of the main function.


// This section handles reading input and calling the main function.
// It uses Node.js 'fs' module to read the content of '/dev/stdin' (standard input)
// as a UTF-8 string, and then passes it to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;