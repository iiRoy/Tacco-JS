/*
 * This section declares global variables used throughout the program.
 * 'n' will likely store the count of some input elements.
 * 's' is an array intended to hold string inputs.
 * 'p' is an array that will store processed data, possibly pairs of numbers.
 */
var n; /* Variable to store the number of inputs */
var s = []; // Array to store input strings
var p = [ ]; // Array to store processed pairs

/*
 * Function: simplify
 * Purpose: Analyzes a given string 's' (expected to contain parentheses)
 *          and returns an array [open_needed, close_needed] representing
 *          the balance of parentheses.
 *          p[0] counts unmatched closing parentheses (needs opening).
 *          p[1] counts unmatched opening parentheses (needs closing).
 */
function simplify( s )
{
	var p = [ 0, 0 ]; // Initialize counts: p[0] for needed open, p[1] for needed close

	// Iterate through each character of the input string 's'
	rep( s.length, function( i )
	{
		// Check if the current character is an opening parenthesis
		if ( s.charAt( i ) === '(' )
		{
			++p[ 1 ]; // Increment count of unmatched opening parentheses
		}
		else // The character is a closing parenthesis
		{
			// If there are open parentheses available to match
			if ( p[ 1 ] > 0 )
			{
				--p[ 1 ]; // Decrement unmatched opening parentheses
			}
			else // No open parentheses to match, so this is an unmatched closing one
			{
				++p[ 0 ]; // Increment count of needed opening parentheses
			}
		}
	} );

	return p; // Return the calculated balance array
}

/*
 * Function: main
 * Purpose: The main execution flow of the program.
 *          It reads input, processes it using 'simplify', sorts the results,
 *          and then attempts to balance the parentheses sequences.
 */
function main()
{
	n = scan(); // Read the number of input strings

	// Read 'n' strings into the 's' array
	rep( n, function( i )
	{
		s[ i ] = scan_string();
	} );

	// Process each string in 's' using the 'simplify' function
	// and store the result (balance array) in the 'p' array
	rep( n, function( i )
	{
		p[ i ] = simplify( s[ i ] );
	} );

	// Sort the 'p' array based on a custom comparison logic.
	// The sorting prioritizes sequences that are 'more open' or have
	// more unmatched opening parentheses after balancing internal pairs.
	p.sort( function( a, b )
	{
		var c = a[ 1 ] - a[ 0 ]; // Difference for element 'a' (open - close needed)
		var d = b[ 1 ] - b[ 0 ]; // Difference for element 'b' (open - close needed)

		// If the differences are not equal, sort by difference in descending order
		if ( c !== d )
		{
			return d - c;
		}
		// If differences are equal, sort by the number of needed open parentheses (a[0])
		// in descending order (b[0] - a[0])
		return b[ 0 ] - a[ 0 ];
	} );

	var q = 0; // 'q' represents the current balance of open parentheses
	var ans = true; // 'ans' tracks if a valid balancing is possible

	// Attempt to balance the sequences in 'p'
	rep( n, function()
	{
		var update = false; // Flag to check if any sequence was processed in this iteration

		// Iterate through the processed sequences 'p'
		rep( n, function( i )
		{
			// Check if the sequence is not null (hasn't been processed yet)
			// and if the current balance 'q' can cover the needed opening parentheses (p[i][0])
			if ( p[ i ] !== null && q >= p[ i ][ 0 ] )
			{
				// Update 'q' by adding the net balance of the current sequence
				q += ( p[ i ][ 1 ] - p[ i ][ 0 ] );
				p[ i ] = null; // Mark this sequence as processed
				update = true; // Set update flag
				return false; // Break from the inner loop (rep) to re-evaluate after update
			}
		} );

		// If no sequence could be processed in this iteration, it's impossible to balance
		if ( !update )
		{
			ans = false; // Set answer to false
			return false; // Break from the outer loop (rep)
		}
	} );

	// Print 'Yes' if all sequences were balanced (ans is true and final balance q is 0),
	// otherwise print 'No'.
	print( ans && q === 0 ? 'Yes' : 'No' );
}

/*
 * Function: rep
 * Purpose: A utility function for looping. It can be used in two ways:
 *          1. rep(count, callback): Loops from 0 to count-1.
 *          2. rep(start, end, callback): Loops from start to end-1.
 *          The loop breaks if the callback function returns 'false'.
 */
function rep( a, b, c )
{
	// Check if 'c' is undefined, indicating the first usage pattern (rep(count, callback))
	if ( c === undefined )
	{
		c = b; // 'c' becomes the callback function
		b = a; // 'b' becomes the loop end count
		a = 0; // 'a' becomes the loop start (from 0)
	}

	// Standard for loop
	for ( var i = a; i < b; ++i )
	{
		// Execute the callback function; if it returns false, break the loop
		if ( c( i ) === false )
		{
			break;
		}
	}
}

// Standard Node.js input/output setup.
process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding( 'utf8' ); // Set input encoding

var input = ''; // Accumulates all input data
var input_index = 0; // Tracks the current position in the input array

/*
 * Function: scan
 * Purpose: Reads and returns the next numeric token from the input.
 */
function scan()
{
	return +input[ input_index++ ]; // Convert string to number using unary plus
}

/*
 * Function: scan_string
 * Purpose: Reads and returns the next string token from the input.
 */
function scan_string()
{
	return input[ input_index++ ];
}

/*
 * Function: print
 * Purpose: Prints a value to the console.
 */
function print( val )
{
	console.log( val );
}

// Event listener for incoming data chunks from stdin
process.stdin.on( 'data', function( chunk )
{
	input += chunk; // Append the received chunk to the 'input' string
} );

// Event listener for the 'end' of stdin input
process.stdin.on( 'end', function()
{
	// Trim whitespace from the input and split it into an array of tokens
	input = input.trim().split( /\s+/ );
	main(); // Call the main function to start program execution
} );