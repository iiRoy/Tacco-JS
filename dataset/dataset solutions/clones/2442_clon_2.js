/*
 * This module processes a numerical input
 * and performs a specific calculation based on its parity.
 */
function HandleNumericalData(incomingNumericData) {
	// Check if the provided numerical data is an even number.
	if (incomingNumericData % 2 === 0) {
		// If it's even, calculate (data / 2) - 1 and output the result.
		console.log((incomingNumericData / 2) - 1);
	} else {
		// Otherwise (if it's an odd number), calculate ((data + 1) / 2) - 1 and output.
		console.log(((incomingNumericData + 1) / 2) - 1);
	} // End of conditional block for parity check
} // End of function definition for HandleNumericalData

// Obtain input from standard input stream, assuming it's UTF-8 encoded text.
// Then, invoke the primary processing function with the retrieved content.
HandleNumericalData(require("fs").readFileSync("/dev/stdin", "utf8"));