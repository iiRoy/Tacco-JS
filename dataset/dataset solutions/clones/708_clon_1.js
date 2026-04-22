/*
 * This file contains a JavaScript program designed to solve a specific
 * algorithmic problem. It includes functions for searching, iteration,
 * and handling input/output operations.
 */

// Global variables declaration.
// These variables store important data used throughout the program's execution.
var    n,   m  ; // n and m are likely related to array sizes or loop counts.

var    a = [ ] ,    b = [ ] ;   /* a and b are arrays that will store numerical data.
                                  * They are initialized as empty arrays. */


/**
 * Performs a binary search on array 'b' to check if a value 'x' exists.
 * Assumes 'b' is sorted in ascending order.
 *
 * @param   {number}  x  The target value to search for.
 * @returns {boolean}    True if 'x' is found in 'b', false otherwise.
 */
function  search ( x )
{
    // Initialize left and right pointers for binary search.
	var   l = 0  ,   r = m ;

	// Loop until the search interval is narrowed down to a single element.
	while ( r - l > 1 )
	{
		// Calculate the middle index using bitwise right shift for efficiency.
		var   c = ( l   +   r )   >>   1 ;

		// Check if the element at the middle index is less than or equal to x.
		if ( b [ c ]   <=   x )
		{
            // If true, move the left pointer to the middle index.
			l = c ;
		}
		else
		{
            // Otherwise, move the right pointer to the middle index.
			r = c ;
		}
	}

    // After the loop, 'l' points to the potential match.
	return   b [ l ]   ===   x ;
}


/*
 * The main entry point of the program.
 * It orchestrates the entire logic, from reading input to printing results.
 */
function  main ( )
{
    // Loop continues as long as scan() returns a truthy value for 'n'.
	while ( n   =   scan ( ) )
	{
		m = scan ( ) ; // Read the value for m.

        // Populate array 'a' with 'n' elements.
		rep ( n ,   function ( i )
        {
			a [ i ]   =   scan ( ) ;
		} ) ;

        // Populate array 'b' with 'm' elements.
		rep ( m ,   function ( i )
        {
			b [ i ]   =   scan ( ) ;
		} ) ;


		// Sort array 'a' in ascending order.
		a . sort ( function ( u ,   v )
        {
			return   u   -   v ;
		} ) ;

		// Sort array 'b' in ascending order.
		b . sort ( function ( u ,   v )
        {
			return   u   -   v ;
		} ) ;


		var   s = 0 ; // Initialize sum 's' for array 'a'.
		rep ( n ,   function ( i )
        {
			s   +=   a [ i ] ;
		} ) ;

		var   t = 0 ; // Initialize sum 't' for array 'b'.
		rep ( m ,   function ( i )
        {
			t   +=   b [ i ] ;
		} ) ;


        // Calculate the difference 'd'.
		var   d = Math . floor ( ( t   -   s )   /   2 ) ;

        // Check if the difference is an odd number.
		if ( ( t   -   s )   !==   ( 2   *   d ) )
		{
            // If odd, print -1 as per problem requirements.
			print ( -1 ) ;
		}
		else
		{
            // If even, proceed to find a solution.
			var   ans = false ; // Flag to track if a solution is found.

            // Iterate through array 'a' to find a suitable element.
			rep ( n ,   function ( i )
            {
                // Check if 'a[i] + d' exists in array 'b'.
				if ( search ( a [ i ]   +   d ) )
				{
                    // If found, print the pair and set 'ans' to true.
					print ( a [ i ]   +   ' '   +   ( a [ i ]   +   d ) ) ;
					ans = true ;
					return   false ; // Stop iteration if a solution is found.
				}
			} ) ;

            // If no solution was found after checking all elements in 'a'.
			if ( ! ans )
			{
				print ( -1 ) ;
			}
		}


        // Reset arrays 'a' and 'b' for the next test case.
		a = [ ] ;
		b = [ ] ;
	}
}


/*
 * A flexible repetition function.
 * It can iterate from 0 to 'a', or from 'a' to 'b'.
 * The callback 'c' is executed for each iteration.
 *
 * @param {number} a    Start index or end limit.
 * @param {number} b    End limit or callback function.
 * @param {Function} c  Callback function (optional if 'b' is the callback).
 * @returns {void}
 */
function  rep ( a ,   b ,   c )
{
    // Handle overloaded function signature: rep(limit, callback) or rep(start, limit, callback)
	if ( c   ===   undefined )
	{
		c = b ;
		b = a ;
		a = 0 ;
	}

    // Loop from 'a' up to (but not including) 'b'.
	for ( var   i = a ;   i   <   b ;   ++ i )
	{
        // If the callback returns false, break the loop prematurely.
		if ( c ( i )   ===   false )
		{
			break ;
		}
	}
}


var   input = '' ; // String to accumulate all standard input data.


/*
 * Scans and parses the next numerical value from the input string.
 * It assumes input is space-separated and reversed.
 *
 * @returns {number} The parsed numerical value.
 */
function  scan ( )
{
	return   + input . pop ( ) ;
}

/*
 * Scans and returns the next string value from the input string.
 *
 * @returns {string} The next string value.
 */
function  scan_string ( )
{
	return   input . pop ( ) ;
}

/*
 * Prints a value to the console.
 *
 * @param {any} val The value to be printed.
 * @returns {void}
 */
function  print ( val )
{
	console . log ( val ) ;
}


// Set up Node.js standard input handling.
process . stdin . resume ( ) ; // Keep the process alive for input.
process . stdin . setEncoding ( 'utf8' ) ; // Specify character encoding.

// Event listener for incoming data chunks.
process . stdin . on ( 'data' ,   function ( chunk )
{
	input   +=   chunk ; // Append chunk to the input string.
} ) ;

// Event listener for the end of input stream.
process . stdin . on ( 'end' ,   function ( )
{
    // Process the accumulated input: trim, split by whitespace, and reverse.
	input   =   input . trim ( ) . split ( / \s + / ) . reverse ( ) ;
	main ( ) ; // Call the main function to start program execution.
} ) ;