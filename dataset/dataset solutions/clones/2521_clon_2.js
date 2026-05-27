'use strict';

/**
 * Core function to process the incoming data stream.
 * @param {string} rawInputData - The complete string content read from the input source.
 */
const processInputData = function (rawInputData) {
    // Divide the raw input string into an array of individual lines.
    const inputLinesArray = rawInputData.split(`\n`);

    // Output the array of lines for diagnostic purposes.
    console.log(inputLinesArray);

    // Parse the first line to extract key numerical parameters.
    // It splits the line by spaces and converts each segment to an integer.
    const firstLineNumericParts = inputLinesArray[0].split(` `).map(itemValue => parseInt(itemValue, 10));

    // The first number in the first line represents the total number of companions.
    const totalCompanionsCount = firstLineNumericParts[0];

    // The second number in the first line represents the minimum required height.
    const minimumRequiredHeight = firstLineNumericParts[1];

    // Parse the second line to get the height data for each companion.
    // It splits the line by spaces and converts each height value to an integer.
    const companionHeightsList = inputLinesArray[1].split(` `).map(itemValue => parseInt(itemValue, 10));

    // Filter the list of companion heights to find those who meet or exceed the minimum required height.
    // Then, count how many companions satisfy this height criterion.
    const eligibleCompanionsTally = companionHeightsList.filter(itemValue => itemValue >= minimumRequiredHeight).length;

    // Display the final count of companions who meet the height requirement.
    console.log(eligibleCompanionsTally);
};

// Execute the main processing function by reading data from standard input.
// The 'fs' module is used to synchronously read the file at '/dev/stdin' as a UTF-8 string.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
