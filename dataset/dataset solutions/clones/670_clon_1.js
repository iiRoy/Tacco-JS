// Declare a variable 'n' to store the number of items or iterations.
var n ;


/*
 * This array 'x' will hold pairs of scanned values.
 * Each element x[i] will be an array [value1, value2].
 */
var x =    [  ] ;


// The primary execution function.
function main ( )
{
    // Loop as long as 'scan()' returns a truthy value, assigning it to 'n'.
    while ( n = scan ( ) )
    {
        // Populate the 'x' array with 'n' pairs of scanned values.
        rep ( n , function ( i )
        {
            x [ i ] = [ scan ( ) , scan ( ) ] ;
        } ) ;


        // Sort the 'x' array based on the second element of each pair (b[1]).
        x . sort ( function ( a , b )
        {
            return a [ 1 ] - b [ 1 ] ; // Ascending sort.
        } ) ;

        // The following line was commented out in the original code.
        // print ( x ) ; // For debugging purposes, uncomment to see sorted array.


        // Initialize 'ans' to true, assuming a successful condition initially.
        var ans = true ;


        // Initialize 'w' (weight/sum) to 0.
        var w = 0 ;


        // Iterate through the sorted 'x' array.
        rep ( n , function ( i )
        {
            // Accumulate the first element of each pair into 'w'.
            w += x [ i ] [ 0 ] ;

            // Update 'ans': it remains true only if 'w' is less than or equal to x[i][1]
            // AND 'ans' was already true.
            ans = w <= x [ i ] [ 1 ] && ans ;
        } ) ;


        // Print "Yes" if 'ans' is true, otherwise "No".
        print ( ans ? "Yes" : "No" ) ;
    }
}


/*
 * This is a utility function for repetition (looping).
 * It can be called with two or three arguments.
 * If three arguments: rep(start, end, callback)
 * If two arguments: rep(end, callback) - start defaults to 0.
 */
function rep ( a , b , c )
{
    // Check if 'c' (the callback) is undefined.
    // This implies 'rep' was called with two arguments.
    if ( c === undefined )
    {
        c = b ; // 'b' is the callback
        b = a ; // 'a' is the end value
        a = 0 ; // 'a' (start) defaults to 0
    }


    // Standard for loop from 'a' up to (but not including) 'b'.
    for ( var i = a ; i < b ; ++i )
    {
        // Execute the callback function 'c' with the current index 'i'.
        // If the callback explicitly returns 'false', break the loop.
        if ( c ( i ) === false )
        {
            break ;
        }
    }
}


// Ensure the standard input stream is active and listening for data.
process.stdin . resume ( ) ;


// Set the character encoding for incoming data on standard input to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;


// A global variable to accumulate all input received from stdin.
var input = '' ;


// An index to keep track of the current position when scanning input tokens.
var input_index = 0 ;


/*
 * Scans and returns the next token from the 'input' array.
 * Optionally converts to a number if 'type' is not 'string'.
 */
function scan ( type )
{
    // If 'type' is explicitly 'string', return the token as a string.
    if ( type === 'string' )
    {
        return input [ input_index ++ ] ;
    }
    // Otherwise, attempt to convert the token to a number using unary plus.
    else
    {
        return + input [ input_index ++ ] ;
    }
}


// A simple wrapper function to print values to the console.
function print ( val )
{
    console . log ( val ) ;
}


// Event listener for incoming data chunks on stdin.
// Appends each chunk to the global 'input' string.
process . stdin . on ( 'data' , function ( chunk )
{
    input += chunk ;
} ) ;


// Event listener for the 'end' of the stdin stream.
process . stdin . on ( 'end' , function ( )
{
    // Trim whitespace from the accumulated input and split it into an array of tokens
    // using one or more whitespace characters as delimiters.
    input = input . trim ( ) . split ( / \s+ / ) ;

    // Once all input is processed and tokenized, call the main function to start execution.
    main ( ) ;
} ) ;