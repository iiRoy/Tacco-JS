'use strict' ; /* This directive ensures strict mode for the entire script. */

// Helper function to destructure an array-like object into a fixed number of variables.
function _slicedToArray ( arr ,  i )
{
    return _arrayWithHoles ( arr ) || _iterableToArrayLimit ( arr ,  i ) || _unsupportedIterableToArray ( arr ,  i ) || _nonIterableRest ( ) ;
}

/*
 * Throws an error if an attempt is made to destructure a non-iterable instance.
 * This function is typically used internally by transpiled code.
 */
function _nonIterableRest ( )
{
    throw new TypeError ( "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method." ) ;
}


// Another helper for handling unsupported iterable types, converting them to arrays.
function _unsupportedIterableToArray ( o ,  minLen )
{
    if ( ! o )
        return ;
    if ( typeof o === "string" )
        return _arrayLikeToArray ( o ,  minLen ) ;
    var n = Object . prototype . toString . call ( o ) . slice ( 8 ,  -1 ) ;
    if ( n === "Object" && o . constructor )
        n = o . constructor . name ;
    if ( n === "Map" || n === "Set" )
        return Array . from ( o ) ;
    if ( n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/ . test ( n ) )
        return _arrayLikeToArray ( o ,  minLen ) ;
}

// Helper to convert an array-like object into a proper array up to a certain length.
function _arrayLikeToArray ( arr ,  len )
{
    if ( len == null || len > arr . length )
        len = arr . length ;
    for ( var i = 0 ,  arr2 = new Array ( len ) ;  i < len ;  i ++ )
    {
        arr2 [ i ] = arr [ i ] ;
    }
    return arr2 ;
}

/*
 * Limits an iterable to a specified number of elements.
 * Handles cases where the iterable might not have a Symbol.iterator or might throw errors.
 */
function _iterableToArrayLimit ( arr ,  i )
{
    if ( typeof Symbol === "undefined" || ! ( Symbol . iterator in Object ( arr ) ) )
        return ;
    var _arr = [ ] ;
    var _n = true ;
    var _d = false ;
    var _e = undefined ;
    try
    {
        for ( var _i = arr [ Symbol . iterator ] ( ) ,  _s ;  ! ( _n = ( _s = _i . next ( ) ) . done ) ;  _n = true )
        {
            _arr . push ( _s . value ) ;
            if ( i && _arr . length === i )
                break ;
        }
    }
    catch ( err )
    {
        _d = true ;
        _e = err ;
    }
    finally
    {
        try
        {
            if ( ! _n && _i [ "return" ] != null )
                _i [ "return" ] ( ) ;
        }
        finally
        {
            if ( _d )
                throw _e ;
        }
    }
    return _arr ;
}

// Checks if an array is a proper JavaScript array.
function _arrayWithHoles ( arr )
{
    if ( Array . isArray ( arr ) )
        return arr ;
}


/**
 * The main function that processes input lines.
 * It solves a dynamic programming problem related to counting numbers divisible by 13.
 * @param {string[]} lines - An array of input strings. The first element is the target string S.
 */
function main ( lines )
{
    // Destructure the first line to get the string S.
    var _lines = _slicedToArray ( lines ,  1 ) ,
        S = _lines [ 0 ] ;

    // Initialize a 2D array (table) for dynamic programming memoization.
    // Dimensions: (S.length + 1) x 13.
    // The maximum length of S is 10^5, so the table size is (10^5 + 1) x 13.
    var table = new Array ( Math . pow ( 10 ,  5 ) + 1 ) . fill ( ) . map ( function ( )
    {
        return new Array ( 13 ) . fill ( ) ;
    } ) ;


    /**
     * Dynamic programming function to calculate the number of ways to form a number
     * from `digits` characters of S such that it has `reminder` when divided by 13.
     * @param {number} digits - The number of digits (from the right) currently being considered.
     * @param {number} reminder - The target remainder when the number formed by these digits is divided by 13.
     * @returns {number} The count of ways modulo (10^9 + 7).
     */
    function dp ( digits ,  reminder )
    {
        // Base case 1: If no digits are left and the reminder is 0, we found one valid way.
        if ( digits === 0 && reminder === 0 )
            return 1 ;

        // Base case 2: If no digits are left but the reminder is not 0, it's not a valid way.
        if ( digits === 0 )
            return 0 ;

        // Check if the result for this state (digits, reminder) is already memoized.
        var val = table [ digits ] [ reminder ] ;
        if ( val !== undefined )
            return val ;

        // Get the current character from S, working from right to left.
        var c = S [ digits - 1 ] ;

        // If the character is a '?', it can be any digit from 0 to 9.
        if ( c === '?' )
        {
            // Calculate the sum of possibilities for each possible digit (0-9).
            return table [ digits ] [ reminder ] = new Array ( 10 ) . fill ( ) . reduce ( function ( acc ,  _ ,  n )
            {
                // For each possible digit 'n', find previous remainders that lead to 'reminder'.
                var val = new Array ( 13 ) . fill ( ) . map ( function ( _ ,  i )
                {
                    return i ;
                } ) . filter ( function ( rem )
                {
                    // (previous_remainder * 10 + current_digit) % 13 should equal target reminder.
                    return ( rem * 10 + n ) % 13 === reminder ;
                } ) . reduce ( function ( acc ,  rem )
                {
                    // Sum up the results from the previous state (digits - 1, rem).
                    return dp ( digits - 1 ,  rem ) + acc ;
                } ,  0 ) ;
                return val + acc ; // Accumulate results for all possible 'n'.
            } ,  0 ) % ( Math . pow ( 10 ,  9 ) + 7 ) ; // Apply modulo operation.
        }

        // If the character is a specific digit.
        var n = Number ( c ) ; // Convert character to a number.

        // Calculate possibilities for this specific digit.
        return table [ digits ] [ reminder ] = new Array ( 13 ) . fill ( ) . map ( function ( _ ,  i )
        {
            return i ;
        } ) . filter ( function ( rem )
        {
            // (previous_remainder * 10 + current_digit) % 13 should equal target reminder.
            return ( rem * 10 + n ) % 13 === reminder ;
        } ) . reduce ( function ( acc ,  rem )
        {
            // Sum up the results from the previous state (digits - 1, rem).
            return dp ( digits - 1 ,  rem ) + acc ;
        } ,  0 ) % ( Math . pow ( 10 ,  9 ) + 7 ) ; // Apply modulo operation.
    }

    // Call the dp function for the full string length and target remainder 5.
    console . log ( dp ( S . length ,  5 ) ) ;
}


// Function to handle reading input from stdin.
function runWithStdin ( )
{
    var input = "" ;
    process . stdin . resume ( ) ; // Ensure stdin is open.
    process . stdin . setEncoding ( "utf8" ) ; // Set encoding for incoming data.

    // Event listener for incoming data.
    process . stdin . on ( "data" ,  function ( v )
    {
        input += v ; // Append data to the input string.
    } ) ;

    // Event listener for the end of input.
    process . stdin . on ( "end" ,  function ( )
    {
        main ( input . split ( "\n" ) ) ; // Process the input by splitting it into lines.
    } ) ;
}

// Execute the function to start reading from stdin.
runWithStdin ( ) ;