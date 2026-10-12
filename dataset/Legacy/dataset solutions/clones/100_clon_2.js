'use strict';

// This script processes input data from standard input.
// It reads the entire content, splits it into lines, and then
// performs a calculation for each line that represents a numeric value.

// Import the Node.js file system module to read input.
let rawData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim any leading/trailing whitespace from the raw input
// and then split the content into an array of strings,
// where each string is a line from the input.
let processedLines = rawData . trim() . split ( '\n' ) ;

// Loop through the array of processed lines as long as it's not empty.
// The loop continues until all lines have been processed.
while ( processedLines . length !== 0 )
{
	// Extract the first line from the array and convert it to a number.
	// The unary plus operator `+` is used for type conversion.
	let currentValue = + processedLines . shift() ;

	// Perform a specific mathematical calculation:
	// 1. Square the numeric value.
	// 2. Divide the result by 98.
	// 3. Add 1 to the quotient.
	// 4. Round the final result up to the nearest whole number using Math.ceil().
	// 5. Print this calculated integer to the console.
	console . log ( Math . ceil ( currentValue * currentValue / 98 + 1 ) ) ;
}
