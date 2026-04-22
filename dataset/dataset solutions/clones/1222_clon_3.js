'use strict';
// This module is designed to process numerical input from a specified source,
// identify three key values (minimum, middle, and maximum) from the initial set,
// and then present them in ascending order.
(function(inputSourceBuffer) {
    // Convert the raw input buffer into a string, ensuring UTF-8 encoding.
    // This makes the data suitable for string manipulation.
    const receivedTextualData = inputSourceBuffer.toString('utf8');

    // Define variables to hold the extracted numerical components.
    let numericComponentList = [];
    const defaultPaddingValue = 0; // A fallback value for insufficient input.

    // Process the first significant line of the input data.
    // This involves splitting by newline and then by spaces,
    // filtering out any empty string tokens that may arise from multiple spaces.
    const primaryInputLine = receivedTextualData.split('\n')[0];
    if (primaryInputLine && primaryInputLine.trim().length > 0) {
        numericComponentList = primaryInputLine.split(' ').filter(token => token.trim() !== '');
    }

    // A crucial validation step: Ensure there are at least three numerical inputs.
    // If fewer than three are provided, pad the list with default values to prevent errors.
    // This ensures the subsequent number parsing and assignment always have sufficient elements.
    while (numericComponentList.length < 3) {
        numericComponentList.push(defaultPaddingValue.toString());
    }

    // Convert the array of string tokens into actual numerical values.
    // The `Number` constructor is used for type conversion.
    const processedNumericalValues = numericComponentList.map(Number);

    // Extract the first three numbers for primary processing.
    // These will be used to determine the minimum, middle, and maximum.
    const firstNum = processedNumericalValues[0];
    const secondNum = processedNumericalValues[1];
    const thirdNum = processedNumericalValues[2];

    // Declare placeholders for the sorted results.
    let smallestValue, centralValue, greatestValue;

    // Directly compute the minimum and maximum using Math utility functions.
    smallestValue = Math.min(firstNum, secondNum, thirdNum);
    greatestValue = Math.max(firstNum, secondNum, thirdNum);

    // Calculate the middle value. A robust method for three numbers is
    // to sum them and then subtract the already found minimum and maximum.
    centralValue = firstNum + secondNum + thirdNum - smallestValue - greatestValue;

    // Output the results to the standard console.
    // The values are presented in ascending order, separated by spaces.
    console.log(`${smallestValue} ${centralValue} ${greatestValue}`);

// The Immediately Invoked Function Expression (IIFE) is executed with the
// content of standard input, read as a raw buffer.
}(require('fs').readFileSync('/dev/stdin')));