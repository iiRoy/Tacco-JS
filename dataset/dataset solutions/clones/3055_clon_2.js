/*
 * This module processes a given binary string
 * to determine the minimum number of flips
 * required to make it an alternating sequence.
 */
const processBinaryString = (rawInputText) => {
	// Parse the raw input: trim whitespace and split into individual characters.
	let charDigits = rawInputText.trim().split("");

	/*
	 * Initialize counters for two possible alternating patterns:
	 * flipsForZeroStart: counts flips needed if the target pattern is 010101...
	 * flipsForOneStart:  counts flips needed if the target pattern is 101010...
	 */
	let flipsForZeroStart = 0, flipsForOneStart = 0;

	for ( let charIndex = 0 ; charIndex < charDigits.length ; charIndex++ ) {
		// Convert the character digit to its numeric value.
		let currentNumericChar = charDigits[charIndex] - '0';

		// Check the parity of the current character's position.
		if ( charIndex % 2 === 0 ) { // Even position (0, 2, 4...)
			// For a 0-start pattern, even positions should be '0'.
			if ( currentNumericChar === 1 ) flipsForZeroStart++;
			// For a 1-start pattern, even positions should be '1'.
			else flipsForOneStart++;
		} else { // Odd position (1, 3, 5...)
			// For a 0-start pattern, odd positions should be '1'.
			if ( currentNumericChar === 0 ) flipsForZeroStart++;
			// For a 1-start pattern, odd positions should be '0'.
			else flipsForOneStart++;
		}
	}

	// Output the smaller of the two flip counts.
	console.log( Math.min( flipsForZeroStart , flipsForOneStart ) );
};

// Execute the main processing function with content read from standard input.
processBinaryString( require('fs').readFileSync('/dev/stdin', 'UTF-8') );