"use strict" ; /*
 *  This directive enforces strict mode parsing and execution in JavaScript.
 *  It helps to catch common coding errors and "unsafe" actions.
 */


//  Import the 'fs' (file system) module to read input from a file.
var   input   =   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

//  Initialize 'cin' (current input) by splitting the input string.
//  Splits by spaces or newlines to create an array of tokens.
//  'cid' (current input index) tracks the position in the 'cin' array.
var   cin   =   input . split ( / | \n / ) ,   cid   =   0 ;


/**
 *  Reads the next token from the input array and converts it to a number.
 *  @returns {number} The next integer from the input.
 */
function   next ( )
{
    return   + cin [ cid++ ] ;
}


/**
 *  Reads the next token from the input array as a string.
 *  @returns {string} The next string token from the input.
 */
function   nextstr ( )
{
    return   cin [ cid++ ] ;
}


/**
 *  Reads the next token from the input array and converts it to a BigInt.
 *  @returns {BigInt} The next BigInt from the input.
 */
function   nextbig ( )
{
    return   BigInt ( cin [ cid++ ] ) ;
}


/**
 *  Reads 'n' tokens from the input array.
 *  If 'a' is true, returns them as strings. Otherwise, converts them to numbers.
 *  @param {number} n - The number of tokens to read.
 *  @param {boolean} [a] - If true, return strings; otherwise, return numbers.
 *  @returns {Array<number|string>} An array of tokens.
 */
function   nexts ( n ,   a )
{
    return   a
        ?   cin . slice ( cid ,   cid   +=   n )
        :   cin . slice ( cid ,   cid   +=   n ) . map ( a   =>   + a ) ;
}


/**
 *  Reads a 2D matrix of 'h' rows and 'w' columns from the input.
 *  If 'a' is true, stores values as strings. Otherwise, converts them to numbers.
 *  @param {number} h - The number of rows.
 *  @param {number} w - The number of columns.
 *  @param {boolean} [a] - If true, store strings; otherwise, store numbers.
 *  @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function   nextm ( h ,   w ,   a )
{
    var   r   =   [ ] ,   i   =   0 ;

    if   ( a )
    {
        for   ( ;   i   <   h ;   i++ )
        {
            r . push ( cin . slice ( cid ,   cid   +=   w ) ) ;
        }
    }
    else
    {
        for   ( ;   i   <   h ;   i++ )
        {
            r . push ( cin . slice ( cid ,   cid   +=   w ) . map ( a   =>   + a ) ) ;
        }
    }

    return   r ;
}


/**
 *  Dynamically creates a multi-dimensional array initialized with a value or expression.
 *  Uses 'eval' for dynamic array creation based on provided dimensions.
 *  @param {*} v - The initial value or expression for array elements.
 *  @returns {Array} The dynamically created multi-dimensional array.
 */
function   xArray ( v )
{
    var   a   =   arguments ,
          l   =   a . length ,
          r   =   "Array(a["   +   -- l   +   "]).fill().map(x=>{return "   +   v   +   ";})" ;

    while   ( -- l )
    {
        r   =   "Array(a["   +   l   +   "]).fill().map(x=>"   +   r   +   ")" ;
    }

    return   eval ( r ) ;
}


//  Call the main function and store its return value.
var   myOut   =   main ( ) ;

//  If the main function returned a value (not undefined), print it to console.
if   ( myOut   !==   undefined )
{
    console . log ( String ( myOut ) ) ;
}


/**
 *  The main function where the primary logic of the program resides.
 *  It processes an array based on specific conditions and returns a sum.
 *  @returns {number} The sum of elements in the processed array.
 */
function   main ( )
{
    //  Read the input 'n' which determines array size.
    var   n   =   next ( ) ;

    //  Create array 'a', starting with a 0, then concatenating 'n' numbers from input.
    var   a   =   [ 0 ] . concat ( nexts ( n ) ) ;

    //  Iterate backwards from 'n' down to 1.
    //  This loop processes elements and modifies the array 'a'.
    for   ( var   i   =   n ;   i   >=   1 ;   i-- )
    {
        //  If the current element 'a[i]' is non-negative, skip to the next iteration.
        if   ( a [ i ]   >=   0 )
        {
            continue ;
        }

        //  Initialize 'sum' for current 'i' to 0.
        var   sum   =   0 ;

        //  Inner loop: Sum elements at multiples of 'i' (j, 2j, 3j, ...).
        for   ( var   j   =   i ;   j   <=   n ;   j   +=   i )
        {
            sum   +=   a [ j ] ;
        }

        //  If the calculated 'sum' for this 'i' is negative:
        if   ( sum   <   0 )
        {
            //  Reset all elements at multiples of 'i' to 0.
            for   ( var   j   =   i ;   j   <=   n ;   j   +=   i )
            {
                a [ j ]   =   0 ;
            }

            //  Reset 'i' to 'n' to restart the outer loop from the beginning
            //  after making modifications that might affect previous sums.
            i   =   n ;
        }
    }

    //  After all processing, calculate the sum of all elements in array 'a'.
    //  The 'reduce' method is used for this, summing 'a' and 'b'.
    return   a . reduce ( ( a ,   b )   =>   a   +   b ) ;
}

// End of file.