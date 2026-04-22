"use strict";

/* This module performs a specific string analysis operation. */
function ProcessString(sourceText) {
	// Convert the incoming text into an array of individual characters.
	const characterArray = sourceText.split("");
	
	// Initialize a counter for discrepancies found during comparison.
	let mismatchCount = 0;
	
	// Iterate through the first half of the character array.
	// Math.ceil is utilized to correctly handle strings with odd total lengths.
	for 
	(
		let idx = 0; 
		idx < Math.ceil(characterArray.length / 2); 
		idx++
	) 
	{
		// Compare the character at the current index 'idx' with its corresponding character
		// located at the symmetrical position from the opposite end of the array.
		if (characterArray[idx] !== characterArray[characterArray.length - 1 - idx]) 
		{
			// If the characters at the compared positions do not match,
			// increment the discrepancy counter.
			mismatchCount++;
		}
	}
	
	// Output the final tally of mismatches to the standard console interface.
	console.log(mismatchCount);
}

// Execute the primary processing function, feeding it content
// obtained by reading from the standard input stream as UTF-8 encoded text.
ProcessString( require("fs").readFileSync("/dev/stdin", "utf8") );