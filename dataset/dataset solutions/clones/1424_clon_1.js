/*
 * This file contains a utility function and its usage.
 * It reads input from standard input and processes it.
 * Created as a Type I clone example.
 */


function    stdin   (   )
{
	// Declare a variable named 'stdin' to store the content read from the file system.
	// We use the 'fs' module for file system operations.
	var    stdin    =    require("fs")
	. readFileSync("/dev/stdin",    "utf8")
	;   // The readFileSync method reads the entire content of a file synchronously.


	// The content read is typically a single string.
	// We then split this string into an array of lines.
	// The regex /\n\r?/ handles both Unix-style (\n) and Windows-style (\r\n) newlines.
	return    stdin.split (   /\n\r?/   )
	; // A function's return statement.
} // End of the 'stdin' function definition.


// This is the main part of the script that executes the logic.

console
. log (
	// First, call the 'stdin' function to get the array of input lines.
	stdin (   )
	// We are interested in the very first line of the input.
	[   0   ]
	// Convert the first line into an array of individual characters.
	. split (   ''   )
	// Apply a transformation to each character using the 'map' method.
	. map (
		// This anonymous function defines the character transformation logic.
		function    (   c   )
		{
			// Check if the current character 'c' is a lowercase letter.
			// The double negation '!!' converts the result of match (null or array) to a boolean.
			return !!c.match(/[a-z]/)
				?   c.toUpperCase() // If it's a lowercase letter, convert it to uppercase.
				:   !!c.match(/[A-Z]/) // Otherwise, check if it's an uppercase letter.
					?   c.toLowerCase() // If it's an uppercase letter, convert it to lowercase.
					:   c // If it's neither, keep the character as it is.
			; // End of the conditional (ternary) operation.
		}
	) // The 'map' method returns a new array with the transformed characters.
	// Finally, join all the transformed characters back into a single string.
	. join (   ''   )
)
; // The console.log function prints the final transformed string to standard output.
// End of the main script execution.