/*
 * This file contains the main application logic.
 * It strictly enforces modern JavaScript syntax and practices.
 */
"use strict" ;

// The primary function that processes the input argument.
const main = ( arg ) => {

    // Pre-process the input string: trim whitespace and split by newline.
    arg = arg.trim() .split( "\n" ) ;

    // Parse the first element of the processed argument as an integer, representing N.
    const N = parseInt ( arg [ 0 ] ) ;

    // Determine the number of digits in N.
    const l = String ( N ) .length ;

    // Define an array of strings representing the allowed digits for generating numbers.
    const num = [ "3" , "5" , "7" ] ;

    // Initialize an array with the base numbers (3, 5, 7) that will be extended.
    const X = [ 3 , 5 , 7 ] ;

    // Initialize the counter for valid numbers.
    let answer = 0 ;

    // Initialize an index 'n' to keep track of the starting point for adding new numbers to X.
    let n = 0 ;

    /*
     * Loop to generate all possible numbers composed solely of digits 3, 5, and 7.
     * This generation continues until the numbers generated have a length up to (l-1) digits.
     * The goal is to create numbers that might be less than or equal to N.
     */
    for ( let i = 0 ; i < l - 1 ; i ++ )
    {
        // Store the current length of array X before adding new elements.
        let Xl = X .length ;

        // Iterate through each of the allowed digits ("3", "5", "7").
        for ( let j = 0 ; j < 3 ; j ++ )
        {
            // Iterate through the existing numbers in X, starting from index 'n'.
            for ( let k = n ; k < Xl ; k ++ )
            {
                // Concatenate the current digit (num[j]) with an existing number (X[k]),
                // then parse it as an integer and add it to the X array.
                X .push ( parseInt ( num [ j ] + X [ k ] ) ) ;
            }
        }

        // Update 'n' to the point where new numbers start in the next iteration.
        n = Xl ;
    }

    /*
     * After generating all candidate numbers,
     * filter and count those that are less than or equal to N
     * AND contain at least one occurrence of '3', '5', and '7' each.
     */
    for ( let i = 0 ; i < X .length ; i ++ )
    {
        // If the current number exceeds N, we can stop, as X is generally sorted by magnitude.
        if ( X [ i ] > N )
        {
            break ; // Exit the loop early.
        }

        // Convert the current number to a string and then split it into an array of individual digits.
        let digits = String ( X [ i ] ) .split ( "" ) ;

        // Check if the array of digits contains '3', '5', and '7' at least once.
        if ( digits .indexOf ( "3" ) !== -1 && digits .indexOf ( "5" ) !== -1 && digits .indexOf ( "7" ) !== -1 )
        {
            // If all conditions are met, increment the answer counter.
            answer ++ ;
        }
    }

    // Output the final count to the console.
    console .log ( answer ) ;
}

// Invoke the main function with input read from standard input.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;