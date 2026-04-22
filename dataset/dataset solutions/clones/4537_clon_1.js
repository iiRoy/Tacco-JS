/*
 * This is the primary function for processing the given input.
 * It expects a string 'input' and performs a specific calculation.
 */
function   Main (    input    )
{

	// The input string is first split into an array of lines.
	// Each element of the array corresponds to a line from the input.
	input   =   input . split (   '\n'   )   ;

	// The first line of the input is then further split by spaces.
	// This is assumed to contain the numbers required for calculation.
	num   =   input [ 0 ] . split (   ' '   )   ;

	// The first part of the split line is converted to a number and stored in 'a'.
	let   a   =   Number (   num [ 0 ]   )   ;

	// The second part of the split line is converted to a number and stored in 'b'.
	let   b   =   Number (   num [ 1 ]   )   ;


	// A conditional check is performed on the sum of 'a' and 'b'.
	// If the sum is 10 or greater, an 'error' message is output.
	if   (   a   +   b   >=   10   )
	{
		console . log (   'error'   )   ; // Output for the error condition.
	}
	// Otherwise, if the sum is less than 10, the actual sum is output.
	else
	{
		console . log (   a   +   b   )   ; // Outputting the calculated sum.
	}

} // End of the Main function definition.


// This section is responsible for reading the input from standard input
// and then invoking the 'Main' function with the obtained data.
Main (
	require (   'fs'   ) . readFileSync (
		'/dev/stdin' , // Path to read standard input.
		'utf8'         // Encoding to use for reading the file.
	)
) ;