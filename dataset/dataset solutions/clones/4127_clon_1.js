/*
 * This JavaScript file processes a series of input lines to perform calculations.
 * It leverages the 'readline' module for asynchronous input handling in Node.js.
 * The core logic involves pre-calculating cumulative sums based on specific
 * mathematical properties of numbers, likely related to primality or a similar concept,
 * and then answering queries based on these pre-calculated sums.
 */

// An array to hold each line read from standard input.
var lines = [ ] ;

// Import the 'readline' module, which provides an interface for reading data
// from a Readable stream (like process.stdin) one line at a time.
var readline = require ( 'readline' ) ;


// Create a readline interface instance. This object will manage the input/output.
var rl = readline . createInterface ( {
    input   :   process . stdin ,   // Set standard input as the source for reading lines.
    output  :   process . stdout    // Set standard output as the destination for console messages.
} ) ;


// Attach an event listener for the 'line' event.
// This function will be called every time a new line of input is received.
rl . on ( 'line' , function ( x )
    {
        // Add the received line (x) to our 'lines' array for later processing.
        lines . push ( x ) ;
    }
) ;


// Attach an event listener for the 'close' event.
// This function executes once all input has been received and the input stream is closed.
rl . on ( 'close' , function ( )
    {
        // --- Data Parsing and Initialization Section ---

        // The first line of input is expected to be the number of queries (Q).
        var Q = Number ( lines [ 0 ] ) ;
        // Remove the first element from the 'lines' array since it's now stored in Q.
        lines . shift ( ) ;

        // Process the remaining lines. Each line 'i' is expected to contain two space-separated numbers.
        // These are parsed into an array of number pairs (e.g., [[L1, R1], [L2, R2], ...]).
        var lr = lines . map ( i => i . split ( " " ) . map ( i => Number ( i ) ) ) ;

        // Create a copy of the 'lr' array and sort it.
        // The sorting criterion is descending order based on the second element of each pair (the 'R' value).
        // This is done to easily find the maximum 'R' value among all queries.
        var x = lr . concat ( ) . sort ( ( a , b ) => b [ 1 ] - a [ 1 ] ) ;

        // The maximum 'R' value across all queries is the second element of the first pair in the sorted 'x' array.
        var max = x [ 0 ] [ 1 ] ;

        // Initialize a 'sum' array. Its size will be 'max + 1'.
        // All elements are initially set to 0. This array will store cumulative counts.
        var sum = Array ( max + 1 ) . fill ( 0 ) ;

        // --- Pre-populating Initial Values for the Cumulative Sum Array ---
        sum [ 0 ] = 0 ; // Base case: sum up to 0.
        sum [ 1 ] = 1 ; // Base case: sum up to 1.
        sum [ 2 ] = 2 ; // Base case: sum up to 2.
        sum [ 3 ] = 3 ; // Base case: sum up to 3.

        // --- Main Calculation Loop ---
        // This loop iterates from 4 up to 'max' to populate the 'sum' array.
        // It calculates a specific property for each number 'i'.
        for ( var i = 4 ; i <= max ; i ++ )
            {
                // Inner loop: checks divisibility conditions for 'i' with 'j' from 2 up to sqrt(i).
                for ( var j = 2 ; j <= Math . sqrt ( i ) ; j ++ )
                    {
                        // Condition 1: If 'i' is perfectly divisible by 'j', it does not satisfy the property.
                        // Break out of the inner loop.
                        if ( i % j === 0 )
                            {
                                break ;
                            }

                        // Condition 2: If ((i + 1) / 2) is perfectly divisible by 'j', it also fails the property.
                        // Break out of the inner loop.
                        if ( ( ( i + 1 ) / 2 ) % j === 0 )
                            {
                                break ;
                            }

                        // Condition 3: If 'j' has reached the floor of sqrt(i) without any breaks,
                        // it means 'i' satisfies the specific property.
                        // Increment the count for 'i' in the 'sum' array.
                        if ( j === Math . floor ( Math . sqrt ( i ) ) )
                            {
                                sum [ i ] ++ ;
                            }
                    }
                // After checking all 'j' for current 'i', update sum[i] to be the cumulative total.
                // This means sum[i] will store the count of numbers satisfying the property from 1 up to 'i'.
                sum [ i ] += sum [ i - 1 ] ;
            }

        // --- Query Processing Section ---
        // Iterate through each of the 'Q' queries.
        for ( var i = 0 ; i < Q ; i ++ )
            {
                // Check if the left bound (lr[i][0]) is equal to the right bound (lr[i][1]).
                if ( lr [ i ] [ 1 ] === lr [ i ] [ 0 ] )
                    {
                        // If they are equal, it implies a single number range.
                        // Output 1 (assuming a single number satisfying the property is counted as 1).
                        console . log ( 1 ) ;
                    }
                else
                    {
                        // If the bounds are different, calculate the count of numbers satisfying the property
                        // within the range [lr[i][0], lr[i][1]] using the pre-calculated cumulative sums.
                        // The result is sum[R-1] - sum[L-1], which gives the count for numbers from L to R (inclusive)
                        // assuming sum[k] is the count up to k.
                        console . log ( sum [ lr [ i ] [ 1 ] - 1 ] - sum [ lr [ i ] [ 0 ] - 1 ] ) ;
                    }
            }

    }
) ;
// End of the script's execution block.