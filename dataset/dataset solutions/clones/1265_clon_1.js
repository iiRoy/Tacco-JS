// This script processes input lines to generate a specific pattern output.
// It uses Node.js Buffer for efficient string manipulation.

var end = false ; // Global flag to signal the termination of processing.

/*
 *  Initializes a small Buffer object with a repeating pattern of '#.'
 *  This pattern will be used to construct larger output lines.
 */
var col_small = new Buffer ( "#.#.#.#.#." ) ;

// Declares and allocates a larger Buffer of 300 bytes.
var col = new Buffer ( 300 ) ;

// A loop to fill the 'col' buffer by repeatedly copying 'col_small'.
// The pattern is copied every 10 bytes, effectively repeating it 30 times.
for ( i = 0 ; i < 300 ; i += 10 )
{
	col_small . copy ( col , i , 0 ) ; // Copies content from col_small to col.
}

// Converts the entire 'col' buffer into a string.
// This string will be sliced later to create 'even' and 'odd' line patterns.
col = col . toString ( ) ;


// This block sets up the main input processing.
// It reads from standard input, splits the content by newlines,
// and then calls the 'main' function for each resulting line.
require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'ascii' ) . split ( '\n' ) . forEach ( main ) ;

// The following line is a commented-out example of how to test the 'main' function
// with predefined static input data, useful for debugging without stdin.
// [ "2 2" , "3 3" , "0 0" ] . forEach ( main ) ;


// The core function that processes each line of input.
function main ( line )
{
	// Checks if the current input line is the termination signal "0 0".
	if ( line === '0 0' )
	{
		end = true ; // Sets the global 'end' flag to true.
		return ;     // Exits the function, preventing further processing for this line.
	}

	// If the 'end' flag is already true (meaning "0 0" was received previously),
	// this function should simply return without doing anything.
	if ( end )
	{
		return ;
	}

	// Splits the input line by space and converts the parts to numbers.
	// Expected format: "H W", where H is height and W is width.
	var hw = line . split ( ' ' ) . map ( Number ) ;

	// Extracts the width (W) from the parsed array.
	var w = hw [ 1 ] ;

	// Defines the 'even' pattern slice from 'col'.
	// This pattern starts from index 0 up to 'w'.
	even = col . slice ( 0 , w ) ;

	// Defines the 'odd' pattern slice from 'col'.
	// This pattern starts from index 1 up to 'w + 1'.
	odd = col . slice ( 1 , w + 1 ) ;

	// Calls the 'write' helper function to print the pattern.
	// It passes height (H) and the dynamically generated 'even' and 'odd' patterns.
	write ( hw [ 0 ] , col . slice ( 0 , w ) , col . slice ( 1 , w + 1 ) ) ;

	// After printing the block of patterns, an empty line is printed for separation.
	console . log ( "" ) ;
}


// A helper function responsible for printing the alternating 'even' and 'odd' patterns.
// It takes the height 'h' and the two pattern strings 'even' and 'odd' as arguments.
function write ( h , even , odd )
{
	var i ; // Loop counter variable.

	// Loops 'h' times, once for each row of the pattern block.
	for ( i = 0 ; i < h ; i ++ )
	{
		// Checks if the current row index 'i' is even.
		if ( i % 2 === 0 )
		{
			console . log ( even ) ; // If even, prints the 'even' pattern.
		}
		else // If the current row index 'i' is odd.
		{
			console . log ( odd ) ; // Prints the 'odd' pattern.
		}
	}
}