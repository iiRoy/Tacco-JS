"use strict" ; /* Enable strict mode for cleaner code. */


/**
 *  @class I
 *  @brief A custom input parser class.
 *  @param {string} s - The input string, typically read from a file.
 *  @param {function} [f=Number] - The parsing function to apply to each token. Defaults to Number.
 */
function I( s , f )
{
    // Store the input string, split by newlines, into an array.
    this._s = s . split ( "\n" ) ;
    // Initialize the current column index.
    this._c = 0 ;
    // Initialize the current line index.
    this._l = 0 ;
    // Store the parsing function, defaulting to Number if not provided.
    this._f = f || Number ;
}


/**
 *  @method a
 *  @memberof I.prototype
 *  @brief Reads and parses the next token from the input.
 *  @returns {*} The parsed token, or undefined if no more input.
 */
I . prototype . a = function ( )
{
    // Get the current line from the stored array.
    var l = this . _s [ this . _l ] ;

    // If the line is undefined (end of input), return immediately.
    if ( ! l )
    {
        return ;
    }

    // Trim whitespace from the line and split it into tokens by space.
    var t = l . trim ( ) . split ( " " ) ;
    // Get the token at the current column index.
    var a = t [ this . _c ] ;

    // Increment the column index for the next read.
    this . _c ++ ;

    // Check if all tokens on the current line have been read.
    if ( t . length === this . _c )
    {
        // Reset column index and move to the next line.
        this . _c = 0 ;
        this . _l ++ ;
    }

    // Parse and return the token using the specified function.
    return this . _f ( a ) ;
} ;


/**
 *  @method l
 *  @memberof I.prototype
 *  @brief Reads and parses all tokens from the current line.
 *  @returns {Array<*>} An array of parsed tokens from the current line, or undefined if no more input.
 */
I . prototype . l = function ( )
{
    // Get the current line from the stored array.
    var l = this . _s [ this . _l ] ;

    // If the line is undefined (end of input), return immediately.
    if ( ! l )
    {
        return ;
    }

    // Reset the column index as we're reading the whole line.
    this . _c = 0 ;
    // Move to the next line.
    this . _l ++ ;

    // Split the line into tokens, then map each token using the parsing function.
    return l . split ( " " ) . map ( this . _f ) ;
} ;


/* Export the I class for use in other modules. */
module . exports = I ;



/**
 *  @function main
 *  @brief The main function that solves the problem.
 *  @param {string} input - The raw input string read from stdin.
 */
function main ( input )
{
    // Create a new instance of the input parser.
    const o = new I ( input ) ;


    // Read the first value, which represents the length 'L'.
    const L = o . a ( ) ;


    // Initialize an empty array to store subsequent input values.
    const A = [ ] ;
    // Loop 'L' times to read 'L' values into array A.
    for ( let i = 0 ; i < L ; i ++ )
    {
        // Read and push each value into array A.
        A . push ( o . a ( ) ) ;
    }


    // Initialize a 2D array 'dp' for dynamic programming.
    // It will have L+1 rows and 5 columns.
    const dp = Array ( L + 1 ) . fill ( ) . map ( ( ) => Array ( 5 ) . fill ( ) ) ;
    // Initialize the base case for dp[0].
    dp [ 0 ] = [ 0 , 0 , 0 , 0 , 0 ] ;


    // Iterate through the input array A to populate the dp table.
    for ( let i = 1 ; i <= L ; i ++ )
    {
        // Get the current element from A (adjusting for 0-based index).
        let cur = A [ i - 1 ] ;

        // Calculate 'curEven': cost if current element is even.
        // If cur is 0, consider it as 2 (special case for problem, perhaps).
        // Otherwise, it's cur % 2.
        let curEven = A [ i - 1 ] === 0 ? 2 : cur % 2 ;

        // Calculate 'curOdd': cost if current element is odd.
        // This is (cur + 1) % 2, which is 1 if cur is even, and 0 if cur is odd.
        let curOdd = ( cur + 1 ) % 2 ;


        // dp[i][0]: Transition for state 0.
        dp [ i ] [ 0 ] = dp [ i - 1 ] [ 0 ] + cur ;
        // dp[i][1]: Transition for state 1.
        dp [ i ] [ 1 ] = Math . min ( dp [ i - 1 ] [ 0 ] , dp [ i - 1 ] [ 1 ] ) + curEven ;
        // dp[i][2]: Transition for state 2.
        dp [ i ] [ 2 ] = Math . min ( dp [ i - 1 ] [ 0 ] , dp [ i - 1 ] [ 1 ] , dp [ i - 1 ] [ 2 ] ) + curOdd ;
        // dp[i][3]: Transition for state 3.
        dp [ i ] [ 3 ] = Math . min ( dp [ i - 1 ] [ 2 ] , dp [ i - 1 ] [ 3 ] ) + curEven ;
        // dp[i][4]: Transition for state 4.
        dp [ i ] [ 4 ] = Math . min ( dp [ i - 1 ] [ 0 ] , dp [ i - 1 ] [ 1 ] , dp [ i - 1 ] [ 2 ] , dp [ i - 1 ] [ 3 ] , dp [ i - 1 ] [ 4 ] ) + cur ;
    }

    // After filling the dp table, the minimum value in the last row (dp[L])
    // represents the final answer. Print it to the console.
    console . log ( Math . min ( ... dp [ L ] ) ) ;
}


// Read the input from standard input using Node.js 'fs' module
// and then call the main function with the obtained input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;