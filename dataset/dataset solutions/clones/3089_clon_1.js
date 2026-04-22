"use strict"
; // Enforce strict mode for better error handling and cleaner code.


/**
 *  Input reader class.
 *  Parses input string into lines and tokens.
 *  @param {string} s - The input string, typically from stdin.
 *  @param {Function} f - Optional parser function for tokens (defaults to Number).
 */
function I
(
    s
    , f
)
{
    // Store lines of the input string
    this._s = s . split ( "\n" ) ;

    // Current column (token) index within the current line
    this._c = 0 ;

    // Current line index
    this._l = 0 ;

    // Function to parse each token; defaults to Number if not provided
    this._f = f || Number ;
}

// Define prototype method 'a' for reading a single token.
I . prototype . a = function ( )
{
    // Retrieve the current line.
    var l = this._s [ this._l ] ;

    // If the line is empty or undefined, return early.
    if ( ! l )
    {
        return ;
    }

    // Trim whitespace and split the line into tokens.
    var t = l . trim ( ) . split ( " " ) ;

    // Get the token at the current column index.
    var a = t [ this._c ] ;

    // Increment the column index for the next read.
    this._c ++ ;

    // Check if all tokens on the current line have been consumed.
    if ( t . length === this._c )
    {
        // Reset column and move to the next line.
        this._c = 0 ;
        this._l ++ ;
    }

    // Parse and return the token.
    return this._f ( a ) ;
}
; // End of I.prototype.a method.


// Define prototype method 'l' for reading all tokens from a line.
I . prototype . l = function ( )
{
    // Get the current line.
    var l = this._s [ this._l ] ;

    // If the line is empty or undefined, return.
    if ( ! l )
    {
        return ;
    }

    // Reset the column index as a whole new line is being processed.
    this._c = 0 ;

    // Move to the next line after reading the current one.
    this._l ++ ;

    // Split the line by spaces, parse each token, and return the array.
    return l . split ( " " ) . map ( this._f )
}
; // End of I.prototype.l method.


/**
 *  Main function to solve the problem.
 *  @param {string} input - The raw input string from stdin.
 */
function main ( input )
{
    // Create a new instance of the Input reader.
    const o = new I ( input ) ;


    // Read the number of elements, N.
    const N = o . a ( ) ;

    // Read the target value, X.
    const X = o . a ( ) ;


    // Initialize an array to store N elements.
    const S = [ ] ;

    // Loop N times to read each element into the array S.
    for ( let i = 0 ; i < N ; i ++ )
    {
        S . push ( o . a ( ) ) ; // Add the read element to S.
    }


    // Sort the array S in ascending order.
    S . sort ( ( a , b ) => a - b ) ;


    // Initialize an array for factorials.
    // fac[0] = 1, fac[1] = 1.
    const fac = [ 1 , 1 ] ;

    // Calculate factorials up to N, modulo 1000000007.
    for ( let i = 2 ; i <= N ; i ++ )
    {
        fac [ i ] = fac [ i - 1 ] * i % 1000000007 ;
    }

    // console.log(sum); // Debugging line, commented out.
    // console.log({S, fac}) // Debugging line, commented out.

    // Call the recursive calculation function and print its result.
    console . log ( calc ( X , "0" . repeat ( N ) ) ) ;


    /**
     *  Recursive function to calculate the result.
     *  @param {number} cur - The current value being processed.
     *  @param {string} mark - A binary string representing which S[i] values have been used ('1') or not ('0').
     *  @returns {number} The calculated result modulo 1000000007.
     */
    function calc ( cur , mark )
    {
        // console.log({cur, mark}) // Debugging line, commented out.

        // Base case: if current value is less than the smallest element in S,
        // it means no more divisions can be performed with S elements.
        if ( cur < S [ 0 ] )
        {
            // Count the number of unused elements (marked '0').
            const unusedCount = mark . split ( "" ) . filter ( x => x === "0" ) . length ;

            // Return cur multiplied by the factorial of unused elements.
            return cur * fac [ unusedCount ] ;
        }

        let index = 0 ; // Initialize index for finding suitable divisors.

        // Find the first element in S that is not less than 'cur'.
        // All elements S[0]...S[index-1] are less than 'cur'.
        while ( S [ index ] < cur )
        {
            index ++ ;
        }

        let result = 0 ; // Accumulator for the results of recursive calls.

        // Iterate through elements in S that are smaller than 'cur'.
        for ( let i = 0 ; i < index ; i ++ )
        {
            // Only consider elements that have not been used yet (marked '0').
            if ( mark [ i ] !== "1" )
            {
                // Create a new mark string by marking the current element as used.
                let newmark = mark . split ( "" ) ;
                newmark [ i ] = "1" ;
                newmark = newmark . join ( "" ) ;

                // Recursively call calc with the remainder and the updated mark.
                result += calc ( cur % S [ i ] , newmark ) ;

                // Apply modulo operation to prevent overflow.
                result = result % 1000000007 ;
            }
        }

        return result ; // Return the accumulated result.
    }
}


// Read input from stdin and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;