/*
 * This is a JavaScript file containing the main logic.
 * It processes input data to calculate a specific value.
 */

function   Main  (  input  ) {
    // The main function starts here.

    // First, split the input string by newline characters.
    input  =  input.split ( '\n' ) ;

    // Extract 'n' from the first line of input.
    const   n   =   input [ 0 ] ;

    // Extract 'As' (an array of strings) from the second line of input.
    const   As   =   input [ 1 ] .split ( ' ' ) ;


    // Initialize an empty object to store frequency pairs.
    const   pairs   =   { } ;

    // Loop through the 'As' array to count frequencies of each element.
    for  (  let   i = 0 ;   i < n ;   i++  )  {
        // Get the current value from the array.
        let   val   =   As [ i ] ;

        // Increment the count for 'val' in the 'pairs' object.
        // If 'val' is not yet a key, initialize its count to 1.
        pairs [ val ]   =   pairs [ val ]   ===   undefined
            ?   1
            :   pairs [ val ]   +   1
        ; // End of ternary assignment.
    }


    // Perform a reverse loop, decrementing by 2.
    // This part checks specific conditions on the 'pairs' object.
    for  (  let   i = n - 1 ;   i > 0 ;   i -= 2  )  {
        // If the frequency of 'i' is not exactly 2, then print 0 and exit.
        if  (  pairs [ i ]   !==   2  )  {
            console.log ( 0 ) ;   // Output 0.
            return  ;             // Terminate the function execution.
        }
    }

    // If all conditions in the loop are met, calculate and print the final result.
    // The result is 2 raised to the power of floor(n/2).
    console.log ( Math.pow ( 2 , Math.floor ( n / 2 ) ) ) ;

}   // End of the Main function.


// This section handles reading input from a file.
// The commented-out line is an alternative way to read the file.
// var input = require("fs").readFileSync("hoge.txt", "utf8")
var   input   =   require ( 'fs' ) .readFileSync ( 'hoge.txt' ,   'utf8' ) ;

// Call the main function with the read input.
Main ( input ) ;