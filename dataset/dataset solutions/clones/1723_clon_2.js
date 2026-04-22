// This function is designed to process incoming text data
function processInputData(sourceContent)
{
	// Divide the raw input string into an array of lines
	// using the newline character as a delimiter.
	let textSegments = sourceContent.split('\n') ;

	// Initialize a counter for differences found between the first two lines.
	let mismatchTally = 0 ;

	// Iterate through each character position of the first line.
	// We assume both lines have at least the length of the first line.
	for (let currentPosition = 0; currentPosition < textSegments[0].length; currentPosition++)
	{
		// Compare characters at the current position in the first and second segments.
		if (textSegments[0].slice(currentPosition, currentPosition + 1) !== textSegments[1].slice(currentPosition, currentPosition + 1))
		{
			// If characters are different, increment the mismatch counter.
			mismatchTally = mismatchTally + 1 ;
		}
	}

	// Output the final count of character mismatches.
	console.log(mismatchTally) ;
}

// Read data from standard input asynchronously and pass it to our processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8")) ;