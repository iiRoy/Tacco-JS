// Enable strict mode for better error handling and cleaner code.
"use strict";


/**
 * Calculates the factorial of a given number.
 * This is a recursive implementation.
 * @param {number} num - The number to calculate the factorial for.
 * @returns {number} The factorial of the number.
 */
function factorial ( num ) {

    // Base case: factorial of 1 is 1.
    if ( num == 1 ) {
        return num;
    }

    // Recursive step: n! = n * (n-1)!
    else {
        return num * factorial ( num - 1 );
    }

}


// Main function to process input and compute the final result.
const main = arg => {

    // Process the raw input argument:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string into an array of lines.
    arg = arg . trim() . split ( "\n" );

    // Parse the input values X and Y from the first line.
    // The first element of the split line is X, the second is Y.
    const X = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] );
    const Y = parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] );


    // Calculate the maximum possible number of '2's that can be used to form X.
    // This is equivalent to X divided by 2, rounded down.
    const numOfTwo = Math . floor ( X / 2 );


    // Initialize an empty array to store the calculated results for valid combinations.
    const list = [];


    // Iterate backwards from the maximum number of '2's down to zero.
    // This loop explores different combinations of '1's and '2's that sum up to X.
    for ( let i = numOfTwo ; i >= 0 ; i -- ) {

        // For the current number of '2's (i), calculate the required number of '1's.
        // X = (2 * i) + (1 * numOfOne)  =>  numOfOne = X - (2 * i)
        const numOfOne = X - ( 2 * i );


        // Check if the current combination (i '2's and numOfOne '1's)
        // can satisfy the condition for Y when their roles are considered differently.
        // If we have 'i' items that were originally '2's, and 'numOfOne' items that were '1's,
        // and if we consider 'i' as the count of '1's for Y, and 'numOfOne' as the count of '2's for Y,
        // then the sum should be Y:  (1 * i) + (2 * numOfOne) === Y
        if ( i + ( 2 * numOfOne ) === Y ) {

            // These lines are commented out as they were likely for debugging.
            // console.log ( "Xには2を" + numOfTwo + "個、1を" + numOfOne + "個使って到達できる" ); // Debug message for X composition
            // console.log ( "Yには1を" + numOfTwo + "個、2を" + numOfOne + "個使って到達できる" ); // Debug message for Y composition

            // Calculate the first temporary value: factorial of (2 * i + numOfOne)
            const temp1 = factorial ( ( 2 * i ) + numOfOne );

            // Calculate the second temporary value: sum of factorial of (2 * i) and factorial of (numOfOne)
            const temp2 = factorial ( ( 2 * i ) ) + factorial ( numOfOne );

            // Push the ratio of temp1 to temp2 into the list.
            list . push ( temp1 / temp2 );

        }

    }


    // After checking all combinations, if the list is empty,
    // it means no valid combinations were found.
    if ( list . length === 0 ) {
        console . log ( 0 ); // Output 0.
        return ;             // Exit the function.
    }


    // If valid combinations were found, calculate the sum of all elements in the list
    // and then take the result modulo 10^9 (10e9).
    console . log ( ( list . reduce ( ( m , n ) => m + n ) ) % 10e9 );

};


// Read the input from standard input (/dev/stdin) using Node.js 'fs' module,
// decode it as UTF-8, and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) );