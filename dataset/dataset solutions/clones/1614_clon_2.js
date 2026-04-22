/*
 * This module processes raw input data to find specific numeric patterns.
 * It counts pairs of numbers that satisfy a certain divisibility condition.
 */
function processInputData(rawData) {
	// Split the raw string input into an array of individual lines.
	let linesOfNumericStrings = rawData.split('\n');

	// Remove the first element, which might be a header or irrelevant.
	linesOfNumericStrings.shift();

	// Initialize a counter for pairs meeting the criteria.
	let validPairCounter = 0;

	// Iterate through the array with an outer loop.
	for (let outerLoopIterator = 0; outerLoopIterator < linesOfNumericStrings.length; outerLoopIterator++) {

		// Start an inner loop from the element after the outer loop's current element
		// to find unique pairs without duplication.
		for (let innerLoopIterator = outerLoopIterator + 1; innerLoopIterator < linesOfNumericStrings.length; innerLoopIterator++) {

			// Define a large scaling factor for calculations.
			const SCALING_CONSTANT = 1_000_000_000; // Represents 10^9

			// Calculate the product of two scaled numbers.
			// Input strings are implicitly converted to numbers during multiplication.
			let calculatedProduct = (linesOfNumericStrings[outerLoopIterator] * SCALING_CONSTANT) *
				(linesOfNumericStrings[innerLoopIterator] * SCALING_CONSTANT);

			// Define the divisor for the modulo operation.
			const MODULO_TARGET = SCALING_CONSTANT * SCALING_CONSTANT; // Represents 10^18

			// Check if the calculated product is perfectly divisible by the target modulo value.
			if (calculatedProduct % MODULO_TARGET === 0) {
				validPairCounter++; // Increment the counter if the condition is met.
			}
		}
	}
	// Output the final count of valid pairs to the console.
	console.log(validPairCounter);
}

// Execute the main processing function with data read from standard input.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));