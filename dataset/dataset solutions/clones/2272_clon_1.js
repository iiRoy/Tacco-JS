// This is the main function that processes the input received.
// It performs a series of calculations based on the provided data.
function main( input )
{
    // Initialize a large modulus value. This is used for final calculations.
    // This specific value is a prime number often used in competitive programming.
    mod = 10000000007 ;

    // Initialize a variable named 'hoge'. Its purpose is not clear from this snippet
    // as it's not used further in the code. Could be a placeholder or unused artifact.
    hoge = 0 ;

    // Split the entire input string into an array of lines.
    // Each element in 'baz' will be a line from the input.
    baz = input . split( "\n" ) ;

    // Parse the first line of the input ('baz[0]') as a number.
    // This number 'N' is likely to represent the count of items or some dimension.
    N = Number( baz[0] ) ;

    /*
     * This block processes the second line of the input.
     * 1. It takes the input string again.
     * 2. Splits it by newline, then selects the second line (index 1).
     * 3. Splits that second line by spaces to get an array of string numbers.
     * 4. Uses 'map' to convert each string number into an integer using parseInt with base 10.
     * The resulting array of integers is stored in 'nums'.
     */
    nums = input
        .split( "\n" ) [1]
        .split( " " )
        .map( n => parseInt( n , 10 ) ) ;

    // Output the array of parsed numbers to the console.
    // This is often for debugging purposes to see what data was read.
    console.log( nums ) ;

    // Initialize 'sum' to zero. This variable will accumulate the sum of certain numbers.
    sum = 0 ;

    // Initialize 'factorial' to one. This variable will compute a factorial value.
    factorial = 1 ;


    // Begin a loop that iterates from 1 up to (but not including) N.
    // The loop variable 'i' is used as an index and for factorial calculation.
    for ( var i = 1 ; i < N ; i++ )
    {
        // Add the number at index 'i' from the 'nums' array to 'sum'.
        sum += nums[i] ;

        // Log the current value of 'sum' after each addition.
        console.log( sum ) ;

        // Multiply 'factorial' by the current loop iteration variable 'i'.
        factorial *= i ;
    }

    // After the loop, perform a calculation: (sum / (N - 1)) * factorial.
    // The result of this intermediate calculation is logged to the console.
    console.log( ( ( sum / ( N - 1 ) ) * factorial ) ) ;

    // Perform the final calculation: take the previous result and apply the modulo operation
    // with the 'mod' variable initialized at the beginning.
    // This final result is also logged to the console.
    console.log( ( ( ( sum / ( N - 1 ) ) * factorial ) % mod ) ) ;
}

// This line executes the 'main' function.
// It reads the content of '/dev/stdin' (standard input) as a UTF-8 string.
// The 'fs' module (file system) is used to read the file synchronously.
main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;