/*
 * This section defines several core utility functions.
 * These are used for common data manipulation tasks throughout the program.
 */

// Function to parse a string into an integer with base 10.
var numericParser = ( inputString ) => {
	return Number.parseInt( inputString , 10 );
};

// Function to convert an array of strings into an array of integers.
var numericArrayParser = ( sourceStringArray ) => {
	return sourceStringArray.map( anItem => numericParser( anItem ) );
};

// Function to compute the absolute value of a number.
// Note: This function is not used in the main logic of the provided example.
var getAbsoluteValue = ( numericalInput ) => {
	return ( numericalInput > 0 ) ? numericalInput : -numericalInput;
};

/*
 * Finds the minimum value among a variable number of arguments.
 * It iterates through the arguments and keeps track of the smallest one found so far.
 */
function findMinimumValue ( ) {
	var argumentList = arguments; // Collect all arguments passed to the function.
	var currentMinimum = argumentList[0]; // Initialize with the first argument.

	// Loop through the rest of the arguments starting from the second one.
	for ( let loopIndex = 1; loopIndex < argumentList.length; loopIndex++ ) {
		if ( argumentList[loopIndex] < currentMinimum ) {
			currentMinimum = argumentList[loopIndex]; // Update if a smaller value is found.
		}
	}
	return currentMinimum; // Return the smallest value.
}

/*
 * Finds the maximum value among a variable number of arguments.
 * It iterates through the arguments and keeps track of the largest one found so far.
 */
function findMaximumValue ( ) {
	var argumentList = arguments; // Collect all arguments.
	var currentMaximum = argumentList[0]; // Initialize with the first argument.

	// Iterate through subsequent arguments.
	for ( let loopIndex = 1; loopIndex < argumentList.length; loopIndex++ ) {
		if ( argumentList[loopIndex] > currentMaximum ) {
			currentMaximum = argumentList[loopIndex]; // Update if a larger value is found.
		}
	}
	return currentMaximum; // Return the largest value.
}


// The primary execution point of the program.
// Reads input from standard input and processes it.
executeMainLogic( require("node:fs").readFileSync("/dev/stdin", "utf8") );


/**
 * Orchestrates the main logic of the application.
 * It processes input data to calculate a specific result.
 * @param {string} programInput - The entire input content as a single string.
 */
function executeMainLogic ( programInput ) {
	// Split the raw input into individual lines.
	var processedInputLines = programInput.split('\n');

	// Parse the first line which contains global parameters.
	var firstLineComponents = processedInputLines[0].split(' ');
	var totalQuantity = numericParser(firstLineComponents[0]); // Represents 'n' from original.
	var numberOfSegments = numericParser(firstLineComponents[1]); // Represents 'm' from original.

	// Initialize an array to store interval definitions.
	var intervalCollection = [];
	// Loop through the subsequent lines to populate the interval data.
	for ( let loopIndex = 0; loopIndex < numberOfSegments; loopIndex++ ) {
		// Parse each line after the first one into an array of numbers.
		let currentSegmentData = numericArrayParser( processedInputLines[loopIndex + 1].split(' ') );
		let segmentStart = currentSegmentData[0]; // The 'a' component of the interval.
		let segmentEnd = currentSegmentData[1];   // The 'b' component of the interval.
		// Store the parsed interval as a pair of numbers.
		intervalCollection[loopIndex] = [segmentStart, segmentEnd];
	}

	// Initialize boundary variables and the result counter.
	// 'currentLowerBound' corresponds to 'l', 'currentUpperBound' to 'r'.
	var currentLowerBound = 0;
	var currentUpperBound = totalQuantity - 1;
	var activeInterval; // Variable to hold the current interval being processed.
	var resultingCount = 1; // The counter for the final result, starts at 1.

	// Iterate through each defined interval to update boundaries and count.
	for ( let iteration = 0; iteration < numberOfSegments; iteration++ ) {
		activeInterval = intervalCollection[iteration]; // Get the current interval.

		// Check if the current interval is completely outside or non-overlapping with the current boundaries.
		// If (activeInterval.end <= currentLowerBound) OR (currentUpperBound <= activeInterval.start)
		if ( activeInterval[1] <= currentLowerBound || currentUpperBound <= activeInterval[0] ) {
			resultingCount++; // Increment the counter as a new non-overlapping segment is found.
			currentLowerBound = activeInterval[0]; // Reset lower bound to the start of this new interval.
			currentUpperBound = activeInterval[1]; // Reset upper bound to the end of this new interval.
		} else {
			// If there's an overlap, adjust the current boundaries to narrow the intersection.
			currentLowerBound = findMaximumValue( currentLowerBound, activeInterval[0] ); // Take the maximum of current lower and interval start.
			currentUpperBound = findMinimumValue( currentUpperBound, activeInterval[1] ); // Take the minimum of current upper and interval end.
		}
	}

	// Output the final calculated count to the console.
	console.log( resultingCount );
}