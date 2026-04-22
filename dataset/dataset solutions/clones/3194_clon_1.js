/*
 * This is a JavaScript file implementing a dynamic programming solution.
 * It calculates the largest possible number that can be formed using a given cost N,
 * where each digit has a specific cost and a preferred digit for that cost.
 */

'use strict' ; // Enforce strict mode for cleaner code.


/**
 * The main function that processes input and orchestrates the calculation.
 * @param {string} input - The raw input string from stdin.
 */
function   Main ( input )
{


    // Split the input string by whitespace and parse each part as an integer.
    input = input . split ( / \s + / ) ;


    for ( let i = 0 ; i < input . length ; i ++ ) {


        input [ i ] = parseInt ( input [ i ] ) ;
    }


    // N is the total cost allowed.
    var   N   =   input . shift ( ) ;
    // M is the number of available digits/costs.
    var   M   =   input . shift ( ) ;


    // Entry is an unused array in the original code, but kept for Type I clone.
    // Represents some initial state, though not directly used in the logic.
    var   Entry   =   [ false , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , ] ;

    // Maps a digit (index) to its corresponding cost.
    // e.g., numToCost[2] = 5 means digit '2' costs 5.
    var   numToCost   =   [ false , 2 , 5 , 5 , 4 , 5 , 6 , 3 , 7 , 6 , ] ;

    // Maps a cost (index) to the largest digit that has that cost.
    // Initialized to false/0.
    var   costToNum   =   [ false , false , 0 , 0 , 0 , 0 , 0 , 0 , ] ;


    // Populate costToNum based on the provided M digits.
    // If multiple digits have the same cost, we prefer the larger digit.
    for ( let i = 0 ; i < M ; i ++ )
    {
        let   num   =   input [ i ] ; // The current digit.
        let   cost   =   numToCost [ input [ i ] ] ; // The cost of this digit.


        if ( num > costToNum [ cost ] )
        {
            costToNum [ cost ] = num ;
        }
    }


    // Clean up costToNum: if a cost has no associated digit, set it to false.
    // This makes checks easier later on.
    for ( let i = 2 ; i < 8 ; i ++ )
    {
        if ( costToNum [ i ] === 0 )
        {
            costToNum [ i ] = false ;
        }
    }


    // dp array for dynamic programming.
    // dp[i] will store an array representing the largest number that can be formed
    // with a total cost of 'i'. The array elements (indices 1-9) store the count
    // of each digit, e.g., dp[i][5] is the count of digit '5'.
    // dp[i][0] is a boolean indicating if a number can be formed for cost 'i'.
    var   dp   =   [ ] ;
    dp [ 0 ]   =   [ true , '' , '' , '' , '' , '' , '' , '' , '' , '' ] ; // Base case: cost 0, empty string for all digits.


    var   i   =   1 ; // Current cost being evaluated.
    while ( i < N + 1 )
    {
        // Iterate through all possible costs (j) for digits.
        // These costs correspond to the indices of numToCost/costToNum.
        for ( let j = 1 ; j < 10 ; j ++ )
        {
            // Check if a number can be formed for cost (i - j) AND
            // if there's a valid digit for cost 'j'.
            if ( dp [ i - j ] && dp [ i - j ] [ 0 ] && costToNum [ j ] )
            {
                // Create a challenger array by copying the state from dp[i-j].
                let   challenger   =   dp [ i - j ] . concat ( ) ;
                let   num   =   costToNum [ j ] ; // The preferred digit for cost 'j'.

                // Increment the count of the chosen digit in the challenger.
                challenger [ num ] = dp [ i - j ] [ num ] + num ;

                // Compare the current best solution for cost 'i' with the challenger.
                // The 'larger' function determines which number is lexicographically greater.
                dp [ i ] = larger ( dp [ i ] , challenger ) ;
            }
        }
        i ++ ; // Move to the next cost.
    }


    // Reconstruct the final string from the dp table for cost N.
    var   str   =   '' ;
    for ( let i = 1 ; i < 10 ; i ++ )
    {
        str = dp [ N ] [ i ] + str ;
    }

    // Output the result.
    console . log ( str ) ;
}


/**
 * Compares two arrays representing numbers (digit counts) and returns the one
 * that corresponds to the lexicographically larger number.
 * Assumes arrays are structured like dp entries: [boolean, count1, count2, ..., count9].
 *
 * @param {Array<any>} a1 - First number representation.
 * @param {Array<any>} a2 - Second number representation.
 * @returns {Array<any>} The array representing the larger number.
 */
function   larger ( a1 , a2 )
{
    if ( a1 === undefined )
        return a2 ; // If a1 is not yet defined, a2 is the first candidate.

    // Compare total length (number of digits). Longer number is larger.
    if ( a1 . join ( ) . length > a2 . join ( ) . length )
        return a1 ;
    if ( a1 . join ( ) . length < a2 . join ( ) . length )
        return a2 ;

    // If lengths are equal, compare digit by digit from largest to smallest.
    // This ensures lexicographical comparison.
    for ( let num = 9 ; num > 0 ; num -- )
    {
        if ( a1 [ num ] . length > a2 [ num ] . length )
            return a1 ;
        if ( a1 [ num ] . length < a2 [ num ] . length )
            return a2 ;
    }

    // If all digits are the same, they are equal, return a1 (arbitrary).
    return a1 ;
}


// Read input from stdin and pass it to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;