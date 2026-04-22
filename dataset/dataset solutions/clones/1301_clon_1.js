/*
 * This is a Type I code clone generated from an original JavaScript source.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace (indentation, line breaks, spacing) and comments have been altered.
 * The functional behavior of this code remains precisely identical to the original.
 */
const rl = require('readline') .createInterface(
	{
		input: process.stdin,
		output: process.stdout
	}
) ;

// Declare various global variables used throughout the program.
var stepnml = 0 ,
	stepa = 0 ,
	stepb = 0 ,
	n ,
	m ,
	l ,
	a = [] ,
	b = [] ,
	decode = decodeNML ; /* The 'decode' variable is initialized but not actively used later
                           in the provided code; its presence might be for a different
                           version or debugging. */

process.stdin.setEncoding('ascii') ; // Set the input encoding for standard input.

// Register an event listener for each line of input received.
rl.on(
	'line' ,
	function ( line )
	{
		// This block handles the state machine for processing input lines.
		if ( stepnml === 0 )
		{
			// First, decode N, M, L from the initial input line.
			decodeNML( line ) ;
		}
		else if ( stepa < n )
		{
			// Next, populate matrix 'a' with 'n' rows.
			decodeA( line ) ;
		}
		else if ( stepb < l )
		{
			// Then, populate matrix 'b' with 'l' rows.
			decodeB( line ) ;
		}
		else
		{
			// If all data is read, close the readline interface.
			rl.close() ;
		}
	}
) ;

// Function to decode the N, M, and L dimensions from the first input line.
function decodeNML( line )
{
	// Split the line by spaces and convert parts to numbers.
	var ary = line.split(' ') .map( Number ) ;

	n = ary[0] ; // Number of rows for matrix 'a'.
	m = ary[1] ; // Number of columns for both matrices (or inner dimension).
	l = ary[2] ; // Number of rows for matrix 'b'.

	var i ; // Loop counter.

	// Initialize matrix 'a' with 'n' rows, each an Int16Array of size 'm'.
	for ( i = n ; i > 0 ; i-- )
	{
		a.push( new Int16Array( m ) ) ;
	}

	// Initialize matrix 'b' with 'l' rows, each an Int16Array of size 'm'.
	for ( i = l ; i > 0 ; i-- )
	{
		b.push( new Int16Array( m ) ) ;
	}

	stepnml++ ; // Increment step counter for NML decoding.
}

// Function to decode a row for matrix 'a'.
function decodeA( line )
{
	var ary = line.split(' ') .map( Number ) ; // Parse numbers from the line.

	// Populate the current row of matrix 'a'.
	for ( var i in ary )
	{
		a[ stepa ] [ i ] = ary[ i ] ;
	}

	stepa++ ; // Move to the next row for matrix 'a'.
}

// Function to decode a row for matrix 'b'.
function decodeB( line )
{
	var ary = line.split(' ') ; // Note: elements are not converted to Number here.

	// Populate the current column of matrix 'b'.
	// This implies 'b' is being read column-wise, which is unusual but matches the original.
	for ( k in ary )
	{
		b[ k ] [ stepb ] = ary[ k ] ;
	}

	stepb++ ; // Move to the next column for matrix 'b'.
}

// Event listener for when the readline interface closes, indicating end of input.
rl.on(
	'close' ,
	function()
	{
		// This block performs the core computation: matrix multiplication-like operation.
		for ( var i in a )
		{
			var line = "" ; // Initialize an empty string for the output line.
			for ( var j in b )
			{
				// Calculate the inner product of row 'i' from 'a' and row 'j' from 'b'.
				// This is effectively calculating an element of the resulting matrix.
				line = line + inner_product( a[ i ] , b[ j ] ) + " " ;
			}
			console.log( line.trim() ) ; // Print the accumulated line, removing trailing space.
		}
	}
) ;

// Calculates the inner product (dot product) of two vectors.
function inner_product( a , b )
{
	var res = 0 ; // Accumulator for the result.
	// Loop backward from m-1 to 0 to sum products.
	for ( var i = m - 1 ; i >= 0 ; i-- )
	{
		res += a[ i ] * b[ i ] ;
	}
	return res ; // Return the computed inner product.
}

// Helper function to print a 2D array (for debugging, not used in main flow).
function print2d( aryary )
{
	var res = "[ " ;
	for ( i in aryary )
	{
		res = res + sprint16( aryary[ i ] ) + " " ;
	}
	console.log( res + "]" ) ;
}

// Helper function to convert a 1D array to a string representation (for debugging).
function sprint16( ary )
{
	var res = "[ " ;
	for ( var i = 0 ; i < ary.length ; i++ )
	{
		res = res + ary[ i ] .toString() + " " ;
	}
	return res + "]" ;
}