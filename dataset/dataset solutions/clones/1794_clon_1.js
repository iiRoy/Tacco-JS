"use strict" ;

/*
 * This section handles input reading from standard input.
 * It uses Node.js 'fs' module to read the entire input
 * and then processes it into an array of strings/numbers.
 */
var input = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ;

var cin = input . split( / |\n/ ) ,
    cid = 0
    ;

/**
 * Retrieves the next number from the input array.
 * Increments the internal cursor 'cid'.
 * @returns {number} The next number.
 */
function next ( )
{
    return +cin[ cid++ ] ;
}

/**
 * Retrieves the next string token from the input array.
 * Increments the internal cursor 'cid'.
 * @returns {string} The next string.
 */
function nextstr ( )
{
    return cin[ cid++ ] ;
}

/**
 * Retrieves the next BigInt from the input array.
 * Increments the internal cursor 'cid'.
 * @returns {BigInt} The next BigInt.
 */
function nextbig ( )
{
    return BigInt( cin[ cid++ ] ) ;
}

/*
 * Fetches an array of 'n' elements from the input.
 * 'a' determines if elements should remain strings or be converted to numbers.
 */
function nexts ( n , a )
{
    return a
           ? cin.slice( cid, cid += n )
           : cin.slice( cid, cid += n ).map( a => +a ) ;
}

/*
 * Fetches an array of 'n' BigInt elements from the input.
 */
function nextsbig ( n )
{
    return cin . slice( cid, cid += n ) . map( a => BigInt( a ) ) ;
}

/**
 * Reads a 2D matrix (h rows, w columns) from the input.
 * 'a' flag indicates if elements should be strings or numbers.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - True for strings, false for numbers.
 * @returns {Array<Array<any>>} The 2D array.
 */
function nextm ( h , w , a )
{
    var r = [ ] ,
        i = 0 ;

    if ( a )
        for ( ; i < h ; i++ )
            r . push( cin . slice( cid , cid += w ) ) ;
    else
        for ( ; i < h ; i++ )
            r . push( cin . slice( cid , cid += w ) . map( a => +a ) ) ;

    return r ;
}

/**
 * Dynamically creates a multi-dimensional array with initial values.
 * @param {*} v - The initial value for the innermost array elements.
 * @returns {Array} The generated multi-dimensional array.
 */
function xArray ( v )
{
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

    while ( --l )
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;

    return eval( r ) ;
}



// Execute the main logic and print the result to the console.
console . log ( main ( ) ) ;


/*
 * The primary function containing the problem's solution.
 */
function main ( )
{
    let N = next ( ) ;
    let K = next ( ) ;
    let A = nexts ( N ) ;

    let B = Array ( N ) ;
    let i , j , k , min , max ;

    for ( k = 0 ; k < K ; k++ )
    {
        B . fill ( 0 ) ;

        let Bmin = k ; // Initialize Bmin for the current iteration

        for ( i = 0 ; i < N ; i++ )
        {
            // Check which positions (j) each bulb at position 'i' illuminates.
            // min and max are 0-indexed positions.
            min = Math . max ( i + 1 - A[ i ] , 1 ) - 1 ;
            max = Math . min ( i + 1 + A[ i ] , N ) - 1 ;

            // console.log ( i, min, max ) ; // Debugging line, kept commented out.

            for ( j = min ; j <= max ; j++ )
            {
                B[ j ]++ ; // Increment count for illuminated positions.
            }

            Bmin = Math . min ( Bmin , B[ i ] ) ;
        }

        A = B . concat ( ) ; // Update A with the new illumination state (B).

        // Optimization: If after a certain number of iterations (e.g., > 41),
        // the minimum illumination count reaches N, it means all bulbs are fully lit
        // and no further changes will occur, so we can break early.
        if ( k > 41 )
        {
            // The following line is commented out as it was part of an alternative approach
            // for ( let i = 0 ; i <= N ; i++ ) Bmin = Math . min ( Bmin , B[ i ] ) ;

            if ( Bmin >= N )
                break ; // All positions are fully illuminated.
        }
    }

    // console.log ( AX ) ; // Another commented-out debugging line, related to a different variable.

    return A . join ( " " ) ; // Return the final state of A as a space-separated string.
}