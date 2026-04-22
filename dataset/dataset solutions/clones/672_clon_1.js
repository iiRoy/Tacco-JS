/*
 * This JavaScript file contains logic for processing input data
 * and performing a specific calculation.
 * It's structured with several helper functions.
 */

// Global variable 'n' to store the number of items or input lines.
var   n    ;

// Global array 'x' to store processed input pairs.
var   x  =  [ ]  ;


/**
 * The main execution function.
 * It continuously reads input until a specific termination condition is met.
 */
function main  (  )   {

	// Loop indefinitely until an explicit 'break' statement is encountered.
	while  (  true  )    {

		// Read the next number from the input stream.
		n   =   scan  (  )   ;

		// Check if the input 'n' signifies the end of processing for a test case.
		if  (  n   ===   0  )    {
			// If 'n' is 0, break out of the infinite loop.
			break   ;
		}


		// Populate the 'x' array with 'n' pairs of scanned values.
		// The 'rep' function acts as a custom loop iterator.
		rep  (  n  ,   function  (  i  )    {
			// Each element of 'x' becomes an array containing two scanned numbers.
			x  [  i  ]   =   [  scan  (  )  ,   scan  (  )   ]   ;
		}  )   ;


		// Sort the 'x' array based on the second element of each inner array.
		// This uses a standard comparison function for numerical sorting.
		x  .  sort  (  function  (  a  ,   b  )    {
			// Returns a negative value if a[1] < b[1], positive if a[1] > b[1], zero if equal.
			return   a  [  1  ]   -   b  [  1  ]   ;
		}  )   ;


		// Initialize a boolean flag to track the answer, assuming 'true' initially.
		var   ans   =   true   ;

		// Initialize a weight variable 'w' to accumulate values.
		var   w   =   0   ;


		// Iterate through the sorted 'x' array to perform the main logic.
		rep  (  n  ,   function  (  i  )    {
			// Add the first element of the current pair to the accumulated weight.
			w   +=   x  [  i  ]  [  0  ]   ;

			// Check if the second element of the current pair is less than the accumulated weight.
			if  (  x  [  i  ]  [  1  ]   <   w  )    {
				// If the condition is met, set 'ans' to false.
				ans   =   false   ;
				// Return 'false' to break out of the 'rep' loop early.
				return   false   ;
			}
		}  )   ;


		// Print the result based on the 'ans' flag.
		// If 'ans' is true, print "Yes"; otherwise, print "No".
		print  (  ans   ?   "Yes"   :   "No"  )   ;

	} // End of while(true) loop.

} // End of main function.


/**
 * A flexible repetition function that can act as a for-loop.
 * It can be called with (end, callback) or (start, end, callback).
 * @param {number} a - Start index or end index.
 * @param {number|Function} b - End index or callback function.
 * @param {Function} [c] - Optional callback function.
 */
function rep  (  a  ,   b  ,   c  )    {

	// Check if the 'c' parameter is undefined, indicating a (end, callback) signature.
	if  (  c   ===   undefined  )    {
		// Adjust parameters for the (end, callback) signature.
		c   =   b   ;
		b   =   a   ;
		a   =   0   ; // Start from 0 by default.
	}

	// Loop from 'a' up to (but not including) 'b'.
	for  (  var   i   =   a  ;   i   <   b  ;   ++i  )    {
		// Execute the callback function 'c' with the current index 'i'.
		// If the callback returns 'false', break the loop.
		if  (  c  (  i  )   ===   false  )    {
			break   ;
		}
	}

} // End of rep function.


// Resume the standard input stream to listen for data.
process  .  stdin  .  resume  (  )   ;

// Set the encoding for the standard input stream to UTF-8.
process  .  stdin  .  setEncoding  (  'utf8'  )   ;


// A global string to accumulate all incoming input data.
var   input   =   ''   ;

// A global index to keep track of the current position in the 'input' string for scanning.
var   input_index   =   0   ;


/**
 * Scans and returns the next value from the processed input.
 * It can parse either as a number (default) or a string.
 * @param {'string'} [type] - Optional type to return a string.
 * @returns {number|string} The scanned value.
 */
function scan  (  type  )    {

	// Check if the requested type is 'string'.
	if  (  type   ===   'string'  )    {
		// Return the current input token as a string and advance the index.
		return   input  [  input_index  ++  ]   ;
	}
	// If not 'string' type, assume number.
	else    {
		// Return the current input token converted to a number and advance the index.
		return   +input  [  input_index  ++  ]   ;
	}

} // End of scan function.


/**
 * Prints a value to the console, followed by a newline.
 * This is a wrapper around console.log.
 * @param {*} val - The value to be printed.
 */
function print  (  val  )    {

	// Output the given value to the standard output.
	console  .  log  (  val  )   ;

} // End of print function.


// Event listener for incoming data on the standard input stream.
process  .  stdin  .  on  (  'data'  ,   function  (  chunk  )    {
	// Append each received chunk of data to the 'input' string.
	input   +=   chunk   ;
}  )   ;

// Event listener for the 'end' of the standard input stream.
process  .  stdin  .  on  (  'end'  ,   function  (  )    {
	// When all input is received, trim whitespace and split it into an array of tokens.
	input   =   input  .  trim  (  )  .  split  (  /\s+/  )   ;
	// Call the main function to start processing the parsed input.
	main  (  )   ;
}  )   ;