'use strict' /* Strict mode enabled for cleaner code execution */ ;

/*
 * This section is for constants and utility functions.
 * It's a common practice to group such definitions.
 */

// Define a large constant value, often used as infinity or a placeholder.
const   INF   =   900719925474099 ;    // Math.floor(Number.MAX_SAFE_INTEGER / 10) is approximately this value.

/**
 * Converts a space-separated string of numbers into an array of integers.
 * @param {string} line - The input string containing space-separated numbers.
 * @returns {number[]} An array of parsed integers.
 */
function mapint ( line )
{
    return line . split ( ' ' ) . map ( ( v ) => parseInt ( v ) ) ;
}

/*
 * This function implements a binary search algorithm
 * to find the lower bound of a value 'e' within a sorted array 'd'.
 * The search is conducted within the range [a, b).
 */
function lower_bound ( d , a , b , e )
{
    for ( var c ; 1 < b - a ; )
    {
        c = 0 | ( a + b ) / 2 ; // Calculate the middle index, bitwise OR with 0 for integer truncation.
        if ( d [ c ] < e )
        {
            a = c ; // If the middle element is less than 'e', search in the right half.
        }
        else
        {
            b = c ; // Otherwise, search in the left half (including the middle element).
        }
    }

    // After the loop, 'a' and 'b' will be adjacent or equal.
    // Determine the exact lower bound index.
    return d [ a ] < e ? b : a ;
};

/*
 * End of utility functions and constants.
 * The following code defines the main logic of the program.
 */

/**
 * The main entry point of the program.
 * It processes input, performs calculations, and prints the result.
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input )
{
    // Trim whitespace and split the input into an array of lines.
    let temp = input . trim ( ) . split ( '\n' ) ;

    // Parse the first line to get N and Q.
    let temp2 = mapint ( temp [ 0 ] ) ;

    let n = temp2 . shift ( ) ; // N is the first element.
    let q = temp2 . shift ( ) ; // Q is the second element.

    // Initialize an array to store N sets of data (stx).
    let stx = new Array ( n ) ;

    // Populate the stx array from the input lines.
    for ( let i = 1 ; i <= n ; i ++ )
    {
        stx [ i - 1 ] = mapint ( temp [ i ] ) ;
    }

    // Initialize an array to store Q queries (d).
    let d = new Array ( q ) ;

    // Populate the d array from the input lines.
    for ( let i = 1 ; i <= q ; i ++ )
    {
        d [ i - 1 ] = parseInt ( temp [ n + i ] ) ;
    }

    // Sort the 'stx' array based on the third element in descending order.
    stx . sort ( ( a , b ) => b [ 2 ] - a [ 2 ] ) ;

    // The console.log statement below is commented out,
    // it was likely used for debugging purposes.
    // console.log(stx.map((a)=>a.join(' ')),d);

    // Initialize an array to store the answers for each query, default to -1.
    let ans = new Array ( q ) . fill ( -1 ) ;

    // Iterate through each item in the sorted 'stx' array.
    for ( let i = 0 ; i < n ; i ++ )
    {
        // Find the lower bound for the left range.
        let l = lower_bound ( d , 0 , q , stx [ i ] [ 0 ] - stx [ i ] [ 2 ] ) ;

        // Find the lower bound for the right range, starting search from 'l'.
        let r = lower_bound ( d , l , q , stx [ i ] [ 1 ] - stx [ i ] [ 2 ] ) ;

        // If the left bound is less than the right bound, it means there's a valid range.
        if ( l < r )
        {
            // Fill the answer array for the found range with the current stx[i][2] value.
            for ( let j = l ; j < r ; j ++ )
            {
                ans [ j ] = stx [ i ] [ 2 ] ;
            }
        }

        // Another commented out debugging line.
        // console.log('i:',i,'l:',l,'r:',r,ans);
    }

    // Print the final answers, each on a new line.
    console . log ( ans . join ( '\n' ) ) ;
}

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;