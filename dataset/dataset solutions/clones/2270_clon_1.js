/*
 * This is the main processing function for the program.
 * It takes an input string, parses it, performs calculations,
 * and then prints a result to the console.
 */
function main ( input ) {


    // Define a large prime number for modulo operations.
    mod = 10000000007 ;


    /*
     * This variable 'hoge' is initialized but not used later in the code.
     * It might be a placeholder or a remnant from previous development.
     */
    hoge = 0 ;


    // Split the entire input string into an array of lines.
    baz = input . split ( "\n" ) ;


    // The first line of input is expected to be a number, N.
    N = Number ( baz[0] ) ;


    /*
     * Parse the second line of the input.
     * It splits the line by spaces and converts each part to an integer.
     * This forms an array of numbers called 'nums'.
     */
    nums = input
             . split ( "\n" ) [ 1 ]
             . split ( " " )
             . map ( n => parseInt ( n , 10 ) ) ;


    // Initialize a variable 'sum' to accumulate values.
    sum = 0 ;



    /*
     * This loop iterates from N-1 down to 1 (exclusive of 0).
     * It sums up elements from the 'nums' array.
     */
    for ( var i = N - 1 ; 0 < i ; i-- ) {

        sum += nums [ i ] ; // Add the current number to the sum.

    }


    // After the loop, divide the accumulated sum by (N-1).
    sum /= ( N - 1 ) ;


    // Initialize a variable 'poke' to 1. This will be used for factorial calculation.
    poke = 1 ;


    /*
     * This loop calculates the factorial of (N-1).
     * It iterates from 1 up to N-1 (exclusive of N).
     */
    for ( var j = 1 ; j < N ; j++ ) {

        poke *= j ; // Multiply 'poke' by the current loop variable 'j'.

    }


    // Finally, calculate (sum * poke) modulo 'mod' and print the result.
    console . log ( ( sum * poke ) % mod ) ;


}

// Read the input from standard input and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;