'use strict';

// This function serves as the primary entry point for the application.
// It processes raw input, performs calculations, and outputs the result.
const executeProgram = function (rawDataInput) {
    // Divide the entire input string into an array of individual lines.
    const lineArray = rawDataInput.split('\n');

    // Display the array of lines for debugging or informational purposes.
    console.log(lineArray);

    // Parse the very first line of input to extract key configuration values.
    // It splits the line by spaces and converts each segment into an integer.
    const firstLineTokens = lineArray[0]
        .split(' ')
        .map(element => parseInt(element, 10)); // Explicitly use base 10 for parsing.

    // The first number from the parsed line represents the total number of companions.
    const totalCompanions = firstLineTokens[0];
    // The second number from the parsed line establishes the minimum height requirement.
    const minimumBarrier = firstLineTokens[1];

    // Process the second line of input, which contains the height measurements for each companion.
    // Similar to the first line, it splits by spaces and converts each measurement to an integer.
    const companionHeights = lineArray[1]
        .split(' ')
        .map(currentHeight => parseInt(currentHeight, 10)); // Ensure base 10 conversion.

    // Filter the array of companion heights to find those that meet or exceed the minimum barrier.
    // Then, count how many companions satisfy this condition.
    const permittedCount = companionHeights
        .filter(currentHeight => currentHeight >= minimumBarrier)
        .length;

    // Output the final count of companions who meet the height criteria.
    console.log(permittedCount);
};

// The program initiates execution by reading data from the standard input.
// It uses the Node.js 'fs' module to read the file content as a UTF-8 string,
// and then passes this raw data to the main processing function.
executeProgram(
    require('fs').readFileSync('/dev/stdin', 'utf8')
);