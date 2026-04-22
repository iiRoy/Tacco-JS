/*
 * This script is designed to process geometric data provided via standard input.
 * It calculates properties of a quadrilateral defined by four points (a, b, c, d)
 * and outputs a determination based on the slopes of its sides.
 */

/*
 * Import the necessary Node.js modules.
 * In this case, we only need the 'fs' (File System) module
 * to read data from standard input synchronously.
 */
var   fs   =   require   (   'fs'   )   ;

// First, determine the total size of the incoming data from standard input.
// This is done by getting file status synchronously for process.stdin.fd.
var   length   =   fs.fstatSync   (   process.stdin.fd   )   .   size   ;

// Allocate a new Buffer object with the determined length to store the input.
var   buffer   =   new   Buffer   (   length   )   ;

// Synchronously read the entire content of standard input into the buffer.
// Parameters: file descriptor, buffer, offset in buffer, number of bytes to read, file position.
var   bytesRead   =   fs.readSync   (   process.stdin.fd   ,   buffer   ,   0   ,   length   ,   0   )   ;

// Convert the buffer's content to a UTF-8 string,
// then split this string into an array of lines using the newline character as a delimiter.
var   input   =   buffer   .   toString   (   'utf8'   ,   0   ,   bytesRead   )   .   split   (   '\n'   )   ;

// Initiate the main execution flow of the program.
main   (   )   ;


/*
 * The main function encapsulates the core logic for processing each line of input.
 * Each line is expected to contain eight comma-separated numerical values
 * representing the x,y coordinates of four points (a, b, c, d).
 * For example: ax,ay,bx,by,cx,cy,dx,dy
 */
function   main   (   )
{
	// Iterate through each line of the 'input' array.
	// The loop condition `input.length - 1` implies that the last line might be empty
	// or serves as a terminator and should not be processed.
	for   (   var   i   =   0   ,   len   =   input.length   -   1   ;   i   <   len   ;   i   ++   )
	{
		// Split the current line of input by the comma delimiter.
		// This yields an array 'c' containing the eight coordinate values as strings.
		var   c   =   input   [   i   ]   .   split   (   ','   )   ;

		// Initialize two counters: 'p' for positive/non-negative conditions,
		// and 'n' for negative conditions. Both start at zero.
		var   p   =   n   =   0   ;


		// Calculate the slope of the line segment from point 'a' to point 'b'.
		// Point 'a' is (c[0], c[1]), Point 'b' is (c[2], c[3]).
		var   ab   =   (   c   [   1   ]   -   c   [   3   ]   )   /   (   c   [   0   ]   -   c   [   2   ]   )   ;   /* Slope of side ab */

		// Calculate the slope of the line segment from point 'b' to point 'c'.
		// Point 'b' is (c[2], c[3]), Point 'c' is (c[4], c[5]).
		var   bc   =   (   c   [   3   ]   -   c   [   5   ]   )   /   (   c   [   2   ]   -   c   [   4   ]   )   ;   /* Slope of side bc */

		// Calculate the slope of the line segment from point 'c' to point 'd'.
		// Point 'c' is (c[4], c[5]), Point 'd' is (c[6], c[7]).
		var   cd   =   (   c   [   5   ]   -   c   [   7   ]   )   /   (   c   [   4   ]   -   c   [   6   ]   )   ;   /* Slope of side cd */

		// Calculate the slope of the line segment from point 'd' to point 'a'.
		// Point 'd' is (c[6], c[7]), Point 'a' is (c[0], c[1]).
		var   da   =   (   c   [   7   ]   -   c   [   1   ]   )   /   (   c   [   6   ]   -   c   [   0   ]   )   ;   /* Slope of side da */


		// Check if the slope 'ab' is greater than or equal to zero.
		// If true, increment 'p'; otherwise, increment 'n'.
		ab   >=   0   ?   p   ++   :   n   ++   ;

		// Perform the same check for slope 'bc'.
		bc   >=   0   ?   p   ++   :   n   ++   ;

		// Perform the same check for slope 'cd'.
		cd   >=   0   ?   p   ++   :   n   ++   ;

		// Perform the same check for slope 'da'.
		da   >=   0   ?   p   ++   :   n   ++   ;


		// Output 'YES' if the counter 'p' is an odd number (p % 2 evaluates to 1, which is truthy).
		// Otherwise, output 'NO' if 'p' is an even number (p % 2 evaluates to 0, which is falsy).
		console.log   (   p   %   2   ?   'YES'   :   'NO'   )   ;

	}   /* End of the loop iterating through input lines. */


}   // End of the main function definition.