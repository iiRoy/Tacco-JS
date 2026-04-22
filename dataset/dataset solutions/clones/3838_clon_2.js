// This file contains a JavaScript routine designed to extract and organize specific textual fragments.

function ProcessInputData( rawData ) {
	// Acquire the primary textual content from the initial element of the provided input array.
	const sourceText = String( rawData[0] );

	// Parse the numerical value representing the target rank from the second input element.
	// An explicit radix of 10 is used to ensure correct integer interpretation.
	const desiredRank = parseInt( rawData[1], 10 );

	// Determine the total number of characters present in the main source string.
	const totalChars = sourceText.length;

	// Perform an initial validation check on the length of the source text.
	// If it falls outside the expected range (1 to 5000 characters), the program terminates.
	if  (  totalChars  <  1  ||  totalChars  >  5000  )
	{
		process.exit(1); // Exit with an error code indicating an invalid text length.
	}

	// Conduct a validation check for the desired rank value.
	// If it is not within the acceptable range (1 to 5), the program exits.
	if ( desiredRank < 1 || desiredRank > 5 ) {
		process.exit(1); // Exit with an error code for an invalid rank.
	}

	let collectedSegments = [ ];  // Initialize an empty array to accumulate unique text segments.
	let currentPiece = '';        // A temporary variable to store the text segment currently under examination.

	// Outer loop: This iteration controls the starting position for each potential segment within the source text.
	for ( let startPosition = 0; startPosition <= totalChars; ++startPosition )
	{
		// Inner loop: This loop determines the ending position for segments,
		// always beginning from the current 'startPosition' of the outer loop.
		for ( let endPosition = startPosition; endPosition <= totalChars; ++endPosition )
		{
			// Extract a slice of the source text using the current start and end positions.
			currentPiece = sourceText.slice( startPosition, endPosition );

			// Conditional check: A segment is added to our collection only if it meets all criteria:
			// 1. It is not already present in 'collectedSegments'.
			// 2. It does not contain a newline character.
			// 3. It is not an empty string.
			if ( !collectedSegments.includes( currentPiece ) && !currentPiece.includes( '\n' ) && currentPiece !== '' )
			{
				collectedSegments.push( sourceText.slice( startPosition, endPosition ) ); // Add the unique and valid segment.
			}
		}
	}

	// Sort the array of collected unique segments alphabetically in ascending order.
	collectedSegments.sort();

	// Output the segment located at the (desiredRank - 1) index.
	// This adjustment is necessary because array indexing is zero-based.
	console.log( collectedSegments[ desiredRank - 1 ] );
}

// Invoke the main processing function.
// It reads data from standard input, decodes it as UTF-8, and splits it into lines
// to form the 'rawData' array expected by 'ProcessInputData'.
ProcessInputData( require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }).split('\n') );