/*
 * This file contains the primary function to process a specific type of input.
 * It reads numerical data, performs iterative decrements based on conditions,
 * and then outputs the final state of the processed numbers.
 *
 * This version is a Type I clone, meaning its functionality is identical,
 * but its formatting, spacing, and comments have been extensively altered
 * to present a visually distinct appearance while preserving all
 * identifiers, operators, and expressions without change.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 */


function Main ( input )
{
	// The initial 'input' is a string.
	// We first split it by spaces to get an array of string numbers.
	// Then, we use the 'map' function to convert each string number to an integer (base 10).
	input = input . split ( " " ) . map ( inp => parseInt ( inp , 10 ) ) ;


	// This 'for' loop iterates a number of times determined by the third element
	// of the now-parsed 'input' array (which is at index 2).
	// The loop variable 'i' starts at 0 and increments by 1 in each cycle.
	for ( var i = 0 ; i < input [ 2 ] ; i ++ )
	{
		// Check if the first element of the input array (index 0) is 1 or greater.
		if ( input [ 0 ] >= 1 )
			// If the condition is true, decrement the first element by 1.
			input [ 0 ] -- ;
		// If the first condition is false (input[0] is 0), then check
		// if the second element of the input array (index 1) is 1 or greater.
		else if ( input [ 1 ] >= 1 )
			// If this second condition is true, decrement the second element by 1.
			input [ 1 ] -- ;
		// If both conditions are false, no operation is performed in this iteration.
	}


	// After the loop completes all its iterations,
	// the final values of the first two elements of the 'input' array are printed
	// to the console, formatted as two decimal integers separated by a space.
	console . log ( "%d %d" , input [ 0 ] , input [ 1 ] ) ;
}


// This line is responsible for initiating the program.
// It reads the entire content of the standard input stream ('/dev/stdin')
// as a UTF-8 encoded string using Node.js's 'fs' module.
// The read string is then passed as an argument to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;