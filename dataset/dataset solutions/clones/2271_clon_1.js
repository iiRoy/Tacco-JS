/*
 * This is a main function designed to process some input.
 * It calculates a specific mathematical expression based on the input data.
 * The input is expected to be a string containing numbers.
 */
function main( input ) {
    // Define a large prime modulus for calculations
    mod  =  10000000007 ;  // The modulus value

    // Initialize a temporary variable, perhaps for future use or debugging.
    hoge =  0 ;


    // Split the input string by newline characters to get individual lines.
    baz = input . split ( "\n" ) ;

    // Parse the first line of the input as the total count 'N'.
    N = Number ( baz [ 0 ] ) ;

    // Process the second line: split by space, then parse each part as an integer.
    nums = input
        .split ( "\n" ) [ 1 ] // Get the second line
        .split ( " " )       // Split numbers by space
        .map ( n  =>  parseInt ( n , 10 ) ) ; // Convert to integers

    // Initialize sum and factorial variables for accumulation.
    sum       = 0 ; // Accumulator for sum
    factorial = 1 ; // Accumulator for factorial


    /*
     * Loop through the numbers from the second element up to N-1.
     * This loop calculates the sum of numbers and the factorial.
     */
    for ( var i = 1 ; i < N ; i ++ ) {
        sum += nums [ i ] ;      // Add current number to sum
        factorial *= i ;         // Multiply current index to factorial
    }

    // Calculate the final result using the accumulated sum and factorial,
    // then apply the modulus operator.
    console.log( ( ( sum / ( N - 1 ) ) * factorial ) % mod ) ;

} /* End of main function */


// Execute the main function with input read from standard input.
// This block handles reading the input file.
main( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of script