'use strict';
// This module handles basic geometric calculations.
function processGeometricData(textualInput) {
	// The raw input string is split into an array of substrings based on whitespace.
	textualInput = textualInput.split();
	
	// Assign the processed input (expected to be an array containing a single numeric string)
	// to a variable representing the geometric dimension.
	let dimensionValue = textualInput;
	
	// Calculate the square of the dimension. JavaScript will implicitly coerce the array
	// to its numeric content for this multiplication operation.
	let calculatedSurface = dimensionValue * dimensionValue;
	
	// Display the final computed surface area to the standard output.
	console.log(calculatedSurface);
}
// Retrieve data from the standard input stream using Node.js file system module,
// then pass the UTF-8 decoded content to the primary processing function.
processGeometricData(require("fs").readFileSync("/dev/stdin", "utf8"));