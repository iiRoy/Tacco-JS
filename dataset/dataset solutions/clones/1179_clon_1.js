/* This script processes numerical data from standard input
 * to calculate standard deviations for sets of numbers.
 * It uses strict mode for better code quality and error handling.
 */
'use strict';

// The entire application logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
// This helps in preventing global variable pollution.
(function ( stdin ) {

    // Read the input stream, convert it to a string, and then split it into an array of individual lines.
    var lines  = stdin . toString () . split ( '\n' );


    // Define a constant representing the End Of Line marker used in the input data.
    // This marker signifies the end of the actual data to be processed.
    var EOL = '0';


    // This variable will hold the final formatted output string.
    // It is populated by another IIFE that handles the core data processing.
    var result = ( function ( data ) {

        // An array to accumulate the standard deviation results for each data set.
        var result = [];

        // Loop through the input 'data' array.
        // Each iteration processes two lines: the count of numbers and the numbers themselves.
        for ( var i = 0 , len = data . length ; i < len ; i += 2 ) {

            // Calculate the standard deviation for the current data set.
            // data[i] is expected to be the count (as a string, but used as number implicitly).
            // data[i + 1] contains space-separated numbers, which are parsed into an array of Numbers.
            result . push ( stdev ( data [ i ] , data [ i + 1 ] . split ( ' ' ) . map ( Number ) ) );

        }

        // After processing all data sets, join the individual standard deviation results
        // with newline characters to form the final output string.
        return result . join ( '\n' );


        /**
         * Helper function to compute the standard deviation for a given set of scores.
         *
         * @param {number} count    - The number of scores to consider for the calculation.
         * @param {number[]} scores - An array of numerical scores.
         * @returns {string}        - The calculated standard deviation, formatted to 8 decimal places.
         */
        function stdev ( count , scores ) {

            // First, calculate the arithmetic mean of the relevant scores.
            // We use 'slice' to ensure only 'count' scores from the beginning are considered.
            var mean = scores
                . slice ( 0 , count )
                . reduce ( function ( a , b ) {

                    return a + b; // Summation of all scores.

                } ) / count ; // Divide by count to get the average.


            // Now, calculate the standard deviation using the mean.
            // The formula is sqrt( sum((x_i - mean)^2) / N ).
            return Math . sqrt (
                    scores
                        . slice ( 0 , count ) // Again, consider only 'count' scores.
                        . map ( function ( v ) {

                            return Math . pow ( v - mean , 2 ); // Calculate (value - mean)^2 for each score.

                        } )
                        . reduce ( function ( a , b ) {

                            return a + b; // Sum up all the squared differences.

                        } ) / count // Divide the sum by 'count' to get the variance.
                ) // Finally, take the square root to get the standard deviation.
                . toFixed ( 8 ) ; // Format the result to 8 decimal places as a string.

        }

    } ( lines . slice ( 0 , lines . indexOf ( EOL ) ) // The input 'data' for this IIFE is a subset of 'lines',
        ) );                                        // from the beginning up to (but not including) the EOL marker.


    // Print the final result string to the standard output.
    console . log ( result );


} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ); // The main IIFE is invoked with the content of /dev/stdin.
                                                                     // 'fs.readFileSync' reads the file synchronously.