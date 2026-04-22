/* This is a strict mode script. */
"use strict" ; // Ensures strict parsing and error handling.

// Main function definition using an arrow function expression.
const main =  (  arg  )   =>   {
    /*
     * Process the input argument.
     * First, remove leading/trailing whitespace.
     * Then, split the string by newline characters.
     */
    arg  =  arg.trim() .split( "\n" ) ;

    // Extract N and Y values from the first line of input.
    // N represents the total number of bills.
    const N = ~~ arg[0] .split( " " )[0] ; // Using bitwise NOT for integer conversion.
    // Y represents the target total price.
    const Y = ~~ arg[0] .split( " " )[1] ; // Another integer conversion.


    // Start nested loops to iterate through possible combinations of bills.
    // 'i' represents the count of 10000-yen bills.
    for ( let i = 0 ; i <= N ; i++ ) {
        // 'j' represents the count of 5000-yen bills.
        for ( let j = 0 ; j <= N ; j++ ) {
            // 'k' represents the count of 1000-yen bills.
            for ( let k = 0 ; k <= N ; k++ ) {
                // Calculate the total price for the current combination.
                let price = ( 10000 * i ) + ( 5000 * j ) + ( 1000 * k ) ;
                // Calculate the total number of bills for the current combination.
                // The `~~` operator converts to integer, though i, j, k are already integers here.
                let bills = ~~ i + ~~ j + ~~ k ;

                // Check if both conditions are met:
                // 1. The calculated price matches the target Y.
                // 2. The calculated number of bills matches the target N.
                if ( Y  ===  price  &&  N  ===  bills ) {
                    // If a solution is found, print the counts and exit the function.
                    console .log( `${i} ${j} ${k}` ) ;
                    return ; // Exit main function immediately.
                }
            } // End of inner-most loop (k)
        } // End of middle loop (j)
    } // End of outer-most loop (i)


    // If no solution is found after checking all combinations, print -1 -1 -1.
    console .log( "-1 -1 -1" ) ;

} // End of the main function.


// Invoke the main function with input read from stdin.
// Reads the entire file as a UTF-8 string.
main( require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' ) ) ;