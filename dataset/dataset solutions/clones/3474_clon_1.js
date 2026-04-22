/*
 * This JavaScript program processes a list of numbers to construct a sequence
 * that minimizes the sum of absolute differences between adjacent elements.
 * It reads input from standard input, performs calculations, and prints the result.
 */

// Function to convert a given value 'd' into an integer.
// This is a standard utility for parsing numeric strings.
function toInt ( d )
{
    // Uses the built-in parseInt function for conversion.
    return parseInt ( d ) ;
}


/**
 * Calculates the sum of absolute differences between all adjacent elements
 * in an array of numbers.
 *
 * @param {Array<number>} d - The input array of numbers.
 * @returns {number} The total sum of absolute differences.
 */
function getDiff ( d )
{
    // Initialize the accumulator for the sum of differences.
    var result = 0 ;

    // Loop through the array from the first element up to the second-to-last element.
    // This allows access to 'd[i]' and 'd[i + 1]' without going out of bounds.
    for ( var i = 0 ; i < d.length - 1 ; i++ )
    {
        // Add the absolute difference between the current element and the next element.
        result += Math.abs( d [ i ] - d [ i + 1 ] ) ;
    }

    // Return the final computed sum.
    return result ;
}


// The primary function of the program, orchestrating input processing and the core logic.
// It takes the raw input string as an argument.
function Main ( input )
{
    // Step 1: Process the input string.
    // - Split the input by newline characters to get an array of string lines.
    // - Map each string line to an integer using the 'toInt' helper function.
    const data = input.split( "\n" ) .map( toInt ) ;

    // The first element of the processed data array is 'N',
    // which represents the count of numbers that follow.
    const N = data [ 0 ] ;

    // Initialize an empty array named 'bucket'. This will hold the numbers
    // that need to be arranged, excluding the 'N' count itself.
    const bucket = [ ] ;

    // Populate the 'bucket' array with the actual numbers from the input,
    // starting from the second element of the 'data' array (index 1).
    for ( var i = 0 ; i < N ; i++ )
    {
        bucket.push( data [ i + 1 ] ) ;
    }

    // Initialize 'resultBucket', which will store the final sequence of numbers
    // arranged to minimize adjacent differences.
    const resultBucket = [ ] ;

    // Sort the 'bucket' array in ascending order. This is crucial for the algorithm
    // to efficiently pick the smallest or largest available numbers.
    bucket.sort( ) ;


    // Initialize a 'turn' variable to alternate between picking 'min' (smallest available)
    // and 'max' (largest available) numbers from the 'bucket'.
    var turn = 'min' ;

    // The main loop continues until 'resultBucket' contains 'N' elements,
    // meaning all numbers have been placed into the final sequence.
    while ( resultBucket.length < N )
    {
        // Check if it's currently the 'min' turn.
        if ( turn === 'min' )
        {
            // Special handling for the very first element to be placed in 'resultBucket'.
            if ( resultBucket.length === 0 )
            {
                resultBucket.push( bucket [ 0 ] ) ; // Place the smallest element.
                bucket.shift( ) ;                   // Remove it from the 'bucket'.
            }
            else // If 'resultBucket' already contains elements.
            {
                // Compare the difference if the smallest available 'bucket[0]' is added
                // to the front versus adding it to the end of 'resultBucket'.
                if ( Math.abs( resultBucket [ 0 ] - bucket [ 0 ] ) > Math.abs( resultBucket [ resultBucket.length - 1 ] - bucket [ 0 ] ) )
                {
                    // If adding to the front creates a larger difference, actually add it to the front.
                    // This strategy appears to be part of a specific heuristic.
                    resultBucket.unshift( bucket.shift( ) ) ;
                    // If 'resultBucket' is not yet full, also take the *next* smallest element
                    // and add it to the other end. This is a greedy approach.
                    if ( resultBucket.length !== N )
                    {
                        resultBucket.push( bucket.shift( ) ) ;
                    }
                }
                else
                {
                    // Otherwise, add the smallest available element to the end of 'resultBucket'.
                    resultBucket.push( bucket.shift( ) ) ;
                    // And if 'resultBucket' is not full, add the *next* smallest element
                    // to the other end (the front).
                    if ( resultBucket.length !== N )
                    {
                        resultBucket.unshift( bucket.shift( ) ) ;
                    }
                }
            }

            // After the 'min' turn, switch to the 'max' turn for the next iteration.
            turn = 'max' ;
        }
        else // It is the 'max' turn.
        {
            // Similar logic as the 'min' turn, but now we consider the largest available
            // element from 'bucket' (which is 'bucket[bucket.length - 1]' after sorting).
            if ( Math.abs( resultBucket [ 0 ] - bucket [ bucket.length - 1 ] ) > Math.abs( resultBucket [ resultBucket.length - 1 ] - bucket [ bucket.length - 1 ] ) )
            {
                // If adding the largest available to the front yields a larger difference, add to the front.
                resultBucket.unshift( bucket.pop( ) ) ; // 'pop' removes the last element.
                // If 'resultBucket' is not yet full, add the *next* largest element to the other end.
                if ( resultBucket.length !== N )
                {
                    resultBucket.push( bucket.pop( ) ) ;
                }
            }
            else
            {
                // Otherwise, add the largest available element to the end of 'resultBucket'.
                resultBucket.push( bucket.pop( ) ) ;
                // If 'resultBucket' is not yet full, add the *next* largest element to the other end.
                if ( resultBucket.length !== N )
                {
                    resultBucket.unshift( bucket.pop( ) ) ;
                }
            }

            // After the 'max' turn, switch to the 'min' turn for the next iteration.
            turn = 'min' ;
        }
    }

    // Once 'resultBucket' is completely filled with 'N' elements,
    // calculate the total absolute difference of its adjacent elements.
    // Then print this final result to the console.
    console.log( getDiff( resultBucket ) ) ;
}

// This line executes the 'Main' function.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string
// using Node.js's 'fs' module, and passes it to 'Main'.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;