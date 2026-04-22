"use strict"
; // Enables strict mode for the entire script.

// This is the main function definition.
// It takes a single argument, typically a string from standard input.

const main = arg =>
{
    // The input argument is processed first.
    // Trim any leading/trailing whitespace and split into lines.
    arg = arg.trim() . split( "\n" ) ;

    // Parse the first line as an integer N.
    const N = parseInt( arg[ 0 ] ) ; // N is usually the count of elements.

    /*
     * The second line contains space-separated numbers.
     * Split them, then map each string to an integer.
     */
    const A = arg[ 1 ] . split( " " ) . map( n => parseInt( n ) ) ;


    // Calculate the total sum of all elements in array A.
    // This uses the reduce method for summation.
    const totalSum = A . reduce( ( m , n ) => m + n ) ;


    // Initialize 'left' sum with the first element of A.
    let left = A[ 0 ] ;
    // Initialize 'right' sum with the total sum minus the first element.
    let right = totalSum - A[ 0 ] ;


    // Initialize the answer variable to a very large number (Infinity).
    // This will be used to find the minimum absolute difference.
    let answer = Infinity ;


    // Loop through each element in array A using a 'for...in' loop.
    // Note: 'for...in' iterates over property names (indices in this case).
    for ( let i in A )
    {
        // Calculate the absolute difference between the current right and left sums.
        let diff = Math . abs( right - left ) ;

        // Update the 'answer' if the current 'diff' is smaller.
        answer = Math . min( answer , diff ) ;


        // Update 'right' sum: subtract the current element A[i].
        right -= A[ i ] ;
        // Update 'left' sum: add the current element A[i].
        left += A[ i ] ;
    }


    // Output the final calculated minimum difference to the console.
    console . log( answer ) ;

}


// Execute the main function.
// Read input from standard input using Node.js 'fs' module.
// The input is read synchronously as UTF-8.
main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;