'use strict';
/*
 * This file contains the main logic for processing a numeric string.
 * The original code might have considered using 'big-integer' for larger numbers,
 * but for the current problem, standard JavaScript numbers are sufficient.
 */


const main = ( input ) => {

    // First, clean up the input string by removing leading/trailing whitespace.
    input = input . trim ();

    // Split the input string into an array of individual digit characters.
    const nums = input . split ( "" );

    // Calculate the number of possible 'plus' signs that can be inserted.
    // This is always one less than the number of digits.
    const plusNum = nums . length - 1;

    // Initialize the variable to store the final sum of all valid expressions.
    let answer = 0;


    // Iterate through all possible combinations of inserting plus signs.
    // Each 'bit' in the 'bit' variable represents a position where a plus sign
    // can either be present (bit is 1) or absent (bit is 0).
    // The total number of combinations is 2^(number of possible plus signs).
    for ( let bit = 0; bit < ( 1 << plusNum ); bit ++ ) {

        // Initialize an array to hold the temporary number strings for the current combination.
        // It always starts with the first digit.
        let tmpStrs = [ nums[ 0 ] ];

        // Loop through each potential position for a plus sign.
        for ( let i = 0; i < plusNum; i ++ ) {

            // Get the next digit character.
            const num = nums[ i + 1 ];

            // Check if the i-th bit is set in the 'bit' mask.
            // If it is, it means a plus sign should be inserted here,
            // so the current digit starts a new number string.
            if ( bit & ( 1 << i ) ) {

                tmpStrs . push ( num );

            } else {
                // If the bit is not set, no plus sign is inserted.
                // The current digit is appended to the last number string.
                tmpStrs[ tmpStrs . length - 1 ] += num;

            }
        }

        // After constructing all number strings for the current combination,
        // sum them up and add to the total answer.
        // The 'reduce' function iterates through 'tmpStrs', converting each string
        // to an integer and accumulating the sum.
        answer += tmpStrs . reduce ( ( acc , cur ) => acc + parseInt ( cur , 10 ) , 0 );

    }


    // Output the final calculated answer to the console.
    console . log ( answer );

};

// This block ensures the 'main' function is called with input from standard input
// when the script is executed.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) );