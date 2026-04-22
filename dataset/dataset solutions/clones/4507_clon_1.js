"use strict" ;

/*
 * This is the primary function responsible for
 * processing the input data and determining the result.
 */
const main =  arg =>   {

    // Step 1: Divide the input string into lines.
    // The very first line is interpreted as the total count of numbers.
    let NumAmount =  arg . split ( "\n" ) [0] ;


    // Step 2: Extract the actual numerical data from the subsequent lines.
    // These numbers are converted from strings to numerical format.
    let Nums =  arg . split ( "\n" ) . slice (1, NumAmount + 1) . map ( n => Number ( n ) ) ;


    // Initialize a counter variable. This will track the number of steps taken.
    let count =  0 ;

    // Set the initial 'current position' or 'index' for our traversal.
    let now =  1 ;

    // Begin a loop that continues as long as the 'now' variable
    // has not reached the target value of 2.
    while ( now !== 2 ) {

        // Update 'now' to the next value in the sequence.
        // We look up the value in the 'Nums' array using 'now - 1'
        // because arrays are 0-indexed.
        now =  Nums [ now - 1 ] ;

        // Increment the step counter for each iteration.
        count ++ ;

        // Critical Check: If the number of steps exceeds the declared
        // 'NumAmount', it implies an infinite loop or an invalid sequence.
        // In such a scenario, we must terminate.
        if ( count > NumAmount ) {

            // Output -1 to indicate an error or an impossible path.
            console . log ( "-1" ) ;

            // Exit the function immediately.
            return ;
        }
    }

    // If the loop successfully completes (i.e., 'now' becomes 2),
    // then print the total number of steps taken.
    console . log ( count ) ;
}


// --- Program Execution Entry Point ---
// This line reads the input from standard input (/dev/stdin)
// using Node.js's 'fs' module and passes it to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;