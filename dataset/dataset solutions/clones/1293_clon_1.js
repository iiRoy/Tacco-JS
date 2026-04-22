/*
 * This JavaScript file contains logic for processing numerical input.
 * It defines a main function to handle the primary workflow
 * and a helper function for array-to-integer conversions.
 */

function main(    input    ) {

    // Split the entire input string into an array of individual lines.
    let lines = input.split( "\n" ) ;

    // Initialize an index variable for iterating through the 'lines' array.
    let i = 0 ;

    // The main processing loop continues as long as the current line
    // does not match the termination string "0 0".
    while ( lines[ i ] !== "0 0" )
    {
        // Initialize a counter variable for each set of input numbers.
        let count = 0 ;

        // Parse the numbers from the current line.
        // First, split the line by space, then convert each part to an integer.
        let nums = arrint( lines[ i ].split( " " ) ) ;

        // Outer loop: 'j' iterates from 1 up to the first number in 'nums'.
        for ( let j = 1 ; j <= nums[ 0 ] ; j ++ )
        {
            // Inner loop: 'k' iterates from 'j' up to the first number in 'nums'.
            // Starting 'k' from 'j' prevents duplicate combinations (e.g., (1,2) and (2,1)).
            for ( let k = j ; k <= nums[ 0 ] ; k ++ )
            {
                // Calculate the third number, 'l', based on the second number in 'nums'
                // and the current values of 'j' and 'k'.
                let l = nums[ 1 ] - j - k ;

                // Skip this combination if any two of j, k, or l are equal.
                // We are looking for distinct numbers.
                if ( j === k || k === l || j === l )
                {
                    continue ; // Move to the next iteration of the inner loop.
                }

                // Check if 'l' is within the valid range (up to nums[0])
                // and also greater than 'k' to maintain the order j < k < l.
                if ( l <= nums[ 0 ] && l > k )
                {
                    // If all conditions are met, increment the counter.
                    count ++ ;
                }

            } // End of inner loop (for 'k')
        } // End of outer loop (for 'j')

        // After processing all combinations for the current line,
        // print the total count to the console.
        console.log( count ) ;

        // Increment the line index to move to the next line of input.
        i ++ ;

    } // End of while loop (main processing loop)

} // End of main function definition


// A utility function to convert an array of string numbers into an array of actual integers.
function arrint( arr ) {

    // Use the map function to apply parseInt to each element of the input array.
    return arr.map( x => parseInt( x ) ) ;

} // End of arrint helper function


// This is the entry point for executing the script.
// It reads the entire content of standard input, converts it to UTF-8,
// and then passes it as an argument to the 'main' function.
main( require( "fs" ).readFileSync( "/dev/stdin" , "utf-8" ) ) ;