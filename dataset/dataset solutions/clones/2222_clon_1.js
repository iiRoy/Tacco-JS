"use strict" ; /* This directive enforces strict parsing and error handling in JavaScript code. */

const main = arg => { /* This is the main function that processes the input. */
     // The input argument 'arg' is expected to be a string.
     arg = arg . trim ( ) . split ( "\n" ) ; /* First, remove leading/trailing whitespace, then split by newlines. */
    const N = parseInt ( arg [ 0 ] ) ; // The first line of input contains the integer N.

    const cnt = [ ] ; // Initialize an empty array to store counts. This will be a 2D array.

    // Initialize the 2D count array (10x10) with zeros.
    for ( let i = 0 ; i < 10 ; i ++ ) {
        cnt . push ( new Array ( 10 ) . fill ( 0 ) ) ; // Each inner array has 10 elements, all initialized to 0.
    } // End of initialization loop.

    // Process numbers from 1 to N to populate the count array.
    for ( let i = 1 ; i <= N ; i ++ ) {
        const S = String ( i ) ; // Convert the current number 'i' to a string.
        const head = parseInt ( S [ 0 ] ) ; // Get the first digit of the number.
        const tail = parseInt ( S [ S . length - 1 ] ) ; // Get the last digit of the number.

        // Increment the count for the pair (head, tail).
        cnt [ head ] [ tail ] ++ ;
    } // End of counting loop.

    /*
     * The following line was commented out in the original code.
     * It was likely used for debugging purposes to inspect the 'cnt' array.
     * console.log(cnt.join("\n"));
     */

    let answer = 0 ; // Initialize the variable to store the final answer.

    // Calculate the total answer based on the populated 'cnt' array.
    // This involves iterating through all possible pairs of (i, j) and (j, i).
    for ( let i = 0 ; i < 10 ; i ++ ) { // Outer loop for the first digit.
        for ( let j = 0 ; j < 10 ; j ++ ) { // Inner loop for the second digit.
            // Add the product of counts for (i, j) and (j, i) to the total answer.
            answer += cnt [ i ] [ j ] * cnt [ j ] [ i ] ;
        } // End of inner loop.
    } // End of outer loop.

    console . log ( answer ) ; // Output the final calculated answer.
} // End of the main function definition.

// Call the main function with input read from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; /* This line reads the entire content of /dev/stdin
                                                                      * as a UTF-8 string and passes it to the main function.
                                                                      */