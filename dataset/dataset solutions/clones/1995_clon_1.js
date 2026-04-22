"use strict" ; /* This directive enforces strict mode for the entire script. */


const main = arg => { // The main function definition starts here, taking 'arg' as input.
    // Initialize a counter variable.
    var count = 0 ;

    /*
     * Process the input string:
     * 1. Remove leading/trailing whitespace using trim().
     * 2. Split the string into an array of lines based on newline characters.
     */
    const input = arg . trim ( ) . split ( "\n" ) ;


    // Parse N and K from the first line of input.
    const N = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // N is the first number on the first line.
    const K = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // K is the second number on the first line.

    // Initialize 'a' with the value of K.
    var a = K ;

    // Loop N times to calculate K^N.
    for ( var s = 1 ; s <= N ; s ++ ) {
        a *= K ; // Multiply 'a' by K in each iteration.
    }

    // Output the calculated value of 'a'.
    console . log ( a ) ;


    // Start of the triple nested loop for GCD calculations.
    // These loops iterate from 1 to 'a' (inclusive) for each variable.
    for ( var i = 1 ; i <= a ; i ++ ) {
        for ( var j = 1 ; j <= a ; j ++ ) {
            for ( var k = 1 ; k <= a ; k ++ ) {
                // Call the gcd function with i, j, and k, and add the result to 'count'.
                count += gcd ( i , j , k ) ;
            }
        }
    }

    // Output the final count divided by 10000000007.
    // This looks like a modulo operation or a specific division required by the problem.
    console . log ( count / 10000000007 ) ;
}

/*
 * This function calculates the greatest common divisor (GCD) of an arbitrary number of arguments.
 * It uses the Euclidean algorithm for two numbers, and extends it for multiple numbers.
 */
function gcd ( ) {
    // Helper function 'f' implements the Euclidean algorithm for two numbers.
    var f = ( a , b ) => b ? f ( b , a % b ) : a ;

    // Initialize the answer with the first argument.
    var ans = arguments [ 0 ] ;

    // Iterate through the remaining arguments, calculating GCD cumulatively.
    for ( var i = 1 ; i < arguments . length ; i ++ ) {
        ans = f ( ans , arguments [ i ] ) ; // Update 'ans' with the GCD of current 'ans' and the next argument.
    }

    // Return the final GCD.
    return ans ;
}

/*
 * This line reads input from standard input, decodes it as UTF-8,
 * and passes it to the 'main' function to start the program execution.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;