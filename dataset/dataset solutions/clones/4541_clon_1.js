/*
 * This JavaScript file processes a given input string.
 * It determines if there are any duplicate characters present in the string
 * after it has been sorted alphabetically.
 * The output will be either "yes" or "no".
 */
"use strict"; // Enforces strict mode parsing and execution for safer code.


const Main = ( input ) => { /* This is the primary function that encapsulates the program's logic.
                              * It takes a single argument, 'input', which is expected to be a string.
                              */

	// First, the input string is trimmed of leading/trailing whitespace.
	// Then, it's split into an array of individual characters.
	// Finally, this character array is sorted alphabetically in ascending order.
	let xs = input . trim ( ) . split ( '' ) . sort ( ) ;


	/*
	 * The following line was previously used for debugging purposes to inspect the sorted character array.
	 * It has been commented out to prevent unnecessary console output during normal execution.
	 * console.log(xs);
	 */


	let ans = '' ; // Initialize a variable to store the final answer ("yes" or "no").


	// Iterate through the sorted array of characters.
	// The loop runs from the first character up to, but not including, the last character.
	for ( let i = 0 ; i < xs . length ; i ++ ) {

		// Check if the current character is identical to the next character in the array.
		// Since the array is sorted, any duplicate characters will be adjacent.
		if ( xs [ i ] == xs [ i + 1 ] ) {
			ans = "no" ; // If a duplicate is found, set the answer to "no".
			break ; // As soon as a duplicate is found, there's no need to check further.
			        // Exit the loop immediately.
		} else {
			ans = "yes" ; /* If the current character is not a duplicate of the next one,
			              * then, so far, no duplicates have been found.
			              * We tentatively set the answer to "yes".
			              * This value will be overwritten if a duplicate is found later in the loop.
			              */
		}

	} // End of the character iteration loop.


	// Output the final determined answer to the console.
	console . log ( ans ) ;

} ; // End of the Main function definition.


// This part of the code handles reading input from the standard input stream.
// It uses Node.js's 'fs' module to read the file at '/dev/stdin' (common for competitive programming).
// The file content is read synchronously as a UTF-8 encoded string.
// This string is then passed as an argument to the 'Main' function to begin processing.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;