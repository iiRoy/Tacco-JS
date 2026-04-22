/*
 * This is a self-executing anonymous function (IIFE)
 * which encapsulates the definition of a data parsing utility.
 * It returns a factory function named 'GET'.
 */
var GET = ( function ( )
{

    // The primary function exposed by this module.
    // It acts as a constructor wrapper for the actual parser 'g'.
    function f ( s )
    {
        return new g ( s ) ; // Create and return a new parser instance.
    }


    /*
     * This is the core parser constructor.
     * It prepares the input string for sequential reading.
     * @param {string} s - The raw input string data.
     */
    function g ( s )
    {
        // Store the processed input: trimmed, then split into lines.
        this . _s = s . trim ( ) . split ( "\n" ) ;

        // Initialize the current line pointer.
        this . _y = 0 ;
    }


    // --- Prototype Methods for the 'g' Parser ---

    /**
     * Reads and returns a single element from the current line.
     * It handles the conversion to a number if specified.
     * @param {boolean} f - If true, return as string; otherwise, as number.
     * @returns {string|number} The parsed element.
     */
    g . prototype . a = function ( f )
    {
        var s = this . _s ; // Reference to the input lines array.
        var y = this . _y ; // Current line index.
        var r ;             // Variable to hold the extracted element.

        // Check if the current line needs to be split and reversed.
        // This pattern suggests elements are consumed from the end of a space-separated string.
        if ( typeof s [ y ] === "string" )
        {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Extract the last element (which is the first logically after reversal).
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty, advance to the next line.
        if ( ! s [ y ] . length )
        {
            this . _y ++ ;
        }

        // Return the result, optionally cast to a number.
        return f ? r : + r ;
    } ;


    /**
     * Reads an entire line, splits it by spaces, and returns the elements.
     * @param {boolean} f - If true, return strings; otherwise, numbers.
     * @returns {Array<string|number>} An array of parsed elements from the line.
     */
    g . prototype . l = function ( f )
    {
        // Get the current line, increment the line pointer, and split it.
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;

        // Return either the string array or an array of numbers.
        return f ? s : s . map ( a => + a ) ;
    } ;


    /**
     * Reads 'n' consecutive lines and parses them as a matrix (2D array).
     * Each line is split by spaces.
     * @param {number} n - The number of lines (rows) to read.
     * @param {boolean} f - If true, return string matrix; otherwise, number matrix.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    g . prototype . m = function ( n , f )
    {
        // Slice the required number of lines and map each line to an array of strings.
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

        // If 'f' is false, further map all elements within the matrix to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;


    /**
     * Reads 'n' consecutive lines, treating each line as a single element.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return string array; otherwise, number array.
     * @returns {Array<string|number>} An array of parsed lines.
     */
    g . prototype . r = function ( n , f )
    {
        // Directly slice the 'n' lines.
        var r = this . _s . slice ( this . _y , this . _y += n ) ;

        // Return either the string array or an array of numbers.
        return f ? r : r . map ( a => + a ) ;
    } ;


    // Return the factory function 'f' to be assigned to 'GET'.
    return f ;

} ) ( ) ; // End of the Immediately Invoked Function Expression.


// Initialize the input parser 'o' by reading data from standard input.
// The 'fs' module is used here to read the file content.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * This function creates a multi-dimensional array dynamically.
 * It's a powerful but potentially unsafe utility due to its use of 'eval'.
 *
 * @param {*} v - The initial value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension of the array.
 * @returns {Array} A new multi-dimensional array.
 */
function xArray ( v )
{
    var a = arguments ;  // Access the arguments object to get dimensions.
    var l = a . length ; // Get the total number of arguments (v + dimensions).

    // Construct the innermost array creation string.
    // Note: --l decrements l before using its value.
    var r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Loop to build the string for outer dimensions, from inner to outer.
    while ( -- l )
    {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Execute the dynamically built string to create the array.
    return eval ( r ) ;
}


// Call the main program logic and print its result to the console.
console . log ( main ( ) ) ;


/**
 * The main execution entry point of the program.
 * It processes input data, performs a complex calculation (likely an optimization problem),
 * and returns a single numerical result.
 * This looks like a binary search implementation combined with some greedy-like logic.
 *
 * @returns {number} The final computed optimal value.
 */
function main ( )
{
    // Read two integer parameters 'n' and 'x' from the input.
    var n = o . a ( ) ;
    var x = o . a ( ) ;

    // Read an 'n' x 3 matrix 'b' from the input.
    // The 'm' method ensures all values are parsed as numbers.
    var b = o . m ( n ) ;

    // Initialize a running sum 's'.
    var s = 0 ;

    // First processing loop: iterate through each row of matrix 'b'.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // Calculate two intermediate values 't' and 'a' for the current row.
        var t = b [ i ] [ 0 ] * b [ i ] [ 1 ] ;          // Product of first two elements.
        var a = ( x - b [ i ] [ 0 ] ) * b [ i ] [ 2 ] ;  // Calculation involving 'x' and the third element.

        // Accumulate 't' into 's'.
        s += t ;

        // Append 'a', 't', and their sum 'a+t' to the current row.
        // The row 'b[i]' will now have 6 elements.
        b [ i ] . push ( a , t , a + t ) ;
    }

    // Sort the 'b' matrix based on the last appended element (index 5) in descending order.
    // This element 'a+t' seems to be a key metric for sorting.
    b . sort ( ( a , b ) => b [ 5 ] - a [ 5 ] ) ;

    // Initialize variables for a binary search.
    // 'ok' represents a "good" (possible) value, 'ng' represents a "not good" (impossible) value.
    var ok = n * x ,   // Initial upper bound for the search range.
        ng = - 1 ;     // Initial lower bound for the search range.

    // Binary search loop: continues as long as there's a range to search.
    while ( ok - ng > 1 )
    {
        // Calculate the middle point 'm' of the current search range.
        var m = Math . floor ( ( ok + ng ) / 2 ) ;

        // Initialize internal state variables for checking the current 'm'.
        var u = s ,      // A running total, initialized with the global sum 's'.
            k = m ,      // A counter, initialized with 'm'.
            z = m % x ,  // Remainder of 'm' divided by 'x'.
            u0 = 0 ,     // Maximum value 'u1' found in the first inner loop.
            i0 = 0 ;     // Index of the row where 'u0' was found.

        // First internal loop: determine 'u0' and 'i0'.
        // This loop iterates through all 'n' items to find a maximum 'u1'.
        for ( var i = 0 ; i < n ; i ++ )
        {
            var u1 ; // Temporary variable for current 'u1' calculation.

            // Conditional calculation of 'u1' based on 'z' and 'b[i][0]'.
            if ( z < b [ i ] [ 0 ] )
            {
                u1 = b [ i ] [ 1 ] * z ;
            }
            else
            {
                u1 = b [ i ] [ 4 ] + ( z - b [ i ] [ 0 ] ) * b [ i ] [ 2 ] ;
            }

            // Update 'u0' and 'i0' if a larger 'u1' is found.
            if ( u1 > u0 )
            {
                u0 = u1 ;
                i0 = i ;
            }
        }

        // Second internal loop: main logic for checking 'm'.
        // This loop processes items while 'k' and 'u' remain positive.
        for ( var i = 0 ; i < n && k > 0 && u > 0 ; i ++ )
        {
            // If 'x' is less than or equal to 'k', perform a full 'x' unit operation.
            if ( x <= k )
            {
                u -= b [ i ] [ 5 ] ; // Subtract the combined value.
                k -= x ;             // Reduce 'k' by 'x'.
            }
            else // If 'k' is less than 'x', partial operation or special handling.
            {
                // If the current item 'i' is the one that yielded 'u0' or comes before it.
                if ( i <= i0 )
                {
                    u -= u0 ; // Subtract the maximum 'u0'.
                    k = 0 ;   // Reset 'k' to zero.
                }
                else // If 'i' is after 'i0'.
                {
                    var v = u ; // Temporary variable 'v' initialized with 'u'.

                    // Adjust 'v' based on 'b[i0][5]', 'b[i][5]', and 'u0'.
                    v += b [ i0 ] [ 5 ] - b [ i ] [ 5 ] - u0 ;

                    // If 'v' is not positive, update 'u' and skip to the next iteration of the outer loop.
                    if ( v <= 0 )
                    {
                        u = v ;
                        continue ;
                    }

                    // Innermost loop: further refine 'v' based on remaining 'k'.
                    // This loop also increments 'i'.
                    for ( v = u ; i < n && v > 0 ; i ++ )
                    {
                        v = u ; // Reset 'v' for each inner iteration.

                        // Conditional calculation based on 'k' and 'b[i][0]'.
                        if ( k < b [ i ] [ 0 ] )
                        {
                            v -= b [ i ] [ 1 ] * k ;
                        }
                        else
                        {
                            v -= b [ i ] [ 4 ] + ( k - b [ i ] [ 0 ] ) * b [ i ] [ 2 ] ;
                        }
                    }
                    u = v ;   // Update 'u' with the final 'v'.
                    k = 0 ;   // Reset 'k'.
                }
            }
        }

        // Update the binary search bounds based on the result of checking 'm'.
        if ( u > 0 )
        {
            ng = m ; // If 'u' is still positive, 'm' was too small; set it as the new lower bound.
        }
        else
        {
            ok = m ; // If 'u' is zero or negative, 'm' was sufficient; set it as the new upper bound.
        }
    }

    // Return the final 'ok' value, which is the result of the binary search.
    return ok ;
}