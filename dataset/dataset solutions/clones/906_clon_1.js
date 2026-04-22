var n ;
var s  =  [ ] ;
var p  =  [ ] ;

/*
 * This function 'simplify' takes a string 's' and processes it
 * to count unmatched parentheses.
 * It returns an array [unmatched_close, unmatched_open].
 */
function  simplify ( s )
{
    var p  =  [ 0 ,  0 ] ; // Initialize a pair for counts: [unmatched_close, currently_open]

    // Iterate over each character of the input string 's'.
    rep ( s.length , function ( i )
    {
        if ( s.charAt(i)  ===  '(' )
        {
            ++p[1] ; // Increment the count of currently open parentheses
        }
        else // If the character is a closing parenthesis
        {
            if ( p[1]  >  0 )
            {
                --p[1] ; // Match an open parenthesis
            }
            else
            {
                ++p[0] ; // It's an unmatched closing parenthesis
            }
        }
    } ) ;
    return p ; // Return the final counts.
}

/*
 * The main function orchestrates the program's logic:
 * reading input, processing strings, sorting, and determining the final answer.
 */
function  main ( )
{
    n  =  scan ( ) ; // Read the number of strings to process.

    rep ( n , function ( i )
    {
        s[i]  =  scan_string ( ) ; // Read 'n' strings into the 's' array.
    } ) ;

    rep ( n , function ( i )
    {
        p[i]  =  simplify ( s[i] ) ; // Simplify each string and store the result in 'p'.
    } ) ;

    // Sort the 'p' array based on custom logic.
    // The sorting prioritizes elements with unmatched closing parentheses.
    p.sort ( function ( a ,  b )
    {
        var c  =  a[1]  -  a[0] ; // Net balance for 'a' (open - close)
        var d  =  b[1]  -  b[0] ; // Net balance for 'b' (open - close)

        if ( c  <  0  &&  d  <  0 ) // If both have more unmatched closing than open
        {
            if ( a[0]  ===  b[0] ) // If the count of unmatched closing is the same
            {
                return d  -  c ; // Sort by net balance in descending order
            }
            else
            {
                return b[0]  -  a[0] ; // Sort by unmatched closing count in descending order
            }
        }
        return d  -  c ; // Default sort by net balance in descending order
    } ) ;

    print ( p ) ; // Output the sorted array (for debugging).

    var q  =  0 ; // 'q' tracks the current balance of open parentheses.
    var ans  =  true ; // 'ans' tracks if a valid sequence can be formed.

    // This loop attempts to "match" parentheses from the sorted 'p' array.
    // It continues as long as an update is possible.
    rep ( n , function ( )
    {
        var update  =  false ; // Flag to check if any 'p' element was processed in this iteration.

        rep ( n , function ( i )
        {
            // Check if 'p[i]' is available and if 'q' can cover its unmatched closing parentheses.
            if ( p[i]  !==  null  &&  q  >=  p[i][0] )
            {
                q  +=  ( p[i][1]  -  p[i][0] ) ; // Update 'q' by adding the net balance of 'p[i]'.
                p[i]  =  null ; // Mark 'p[i]' as processed.
                update  =  true ; // Indicate that an update occurred.
                return false ; // Break out of the inner loop.
            }
        } ) ;

        if ( !update ) // If no element could be processed in this outer iteration
        {
            ans  =  false ; // It's not possible to form a valid sequence.
            return false ; // Break out of the outer loop.
        }
    } ) ;
    // Final check: 'ans' must be true and 'q' must be 0 for a valid sequence.
    print ( ans  &&  q  ===  0  ?  'Yes'  :  'No' ) ;
}

/*
 * A generic repetition function.
 * It can be called with `rep(count, callback)` or `rep(start, end, callback)`.
 * The callback function can return `false` to break the loop.
 */
function  rep ( a ,  b ,  c )
{
    if ( c  ===  undefined ) // Check for the `rep(count, callback)` signature.
    {
        c  =  b ; // 'c' becomes the callback.
        b  =  a ; // 'b' becomes the count.
        a  =  0 ; // 'a' becomes the starting index (0).
    }
    for ( var i  =  a ;  i  <  b ;  ++i ) // Loop from 'a' up to (but not including) 'b'.
    {
        if ( c(i)  ===  false ) // Execute callback; if it returns false, break.
        {
            break ;
        }
    }
}

// Standard Node.js input/output setup.
process.stdin.resume ( ) ;
process.stdin.setEncoding ( 'utf8' ) ;

var input  =  '' ; // Buffer to accumulate input data.
var input_index  =  0 ; // Index to track current position in the processed input array.

/*
 * Reads a number from the global 'input' array.
 * Assumes 'input' contains parsed numbers/strings.
 */
function  scan ( )
{
    return +input[ input_index++ ] ; // Convert string to number using unary plus.
}

/*
 * Reads a string from the global 'input' array.
 */
function  scan_string ( )
{
    return input[ input_index++ ] ;
}

/*
 * Prints a value to the console, followed by a newline.
 */
function  print ( val )
{
    console.log ( val ) ;
}

// Event listener for incoming data on standard input.
process.stdin.on ( 'data' , function ( chunk )
{
    input  +=  chunk ; // Append new data to the input buffer.
} ) ;

// Event listener for the end of standard input.
process.stdin.on ( 'end' , function ( )
{
    input  =  input.trim ( ) .split ( /\s+/ ) ; // Clean and split input into an array of strings.
    main ( ) ; // Call the main function to start processing.
} ) ;