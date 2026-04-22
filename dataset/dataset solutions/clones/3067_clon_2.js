/*
 * This module processes multi-line numerical input
 * to compute a specific aggregated sum.
 */
function processInputData(rawDataString)
{
    // Split the entire input string into individual lines.
    // Each line is expected to contain a number.
    let inputLinesArray = rawDataString.split('\n');

    // A temporary array, currently unused but maintained for structural consistency.
    const temporaryStorage = [ ];

    // Transform each line string into a pair of numbers.
    // The second number in the pair is either 10 (if the original number is a multiple of 10)
    // or the remainder when divided by 10.
    const numericCalculations = inputLinesArray.map(lineText => {
        // Convert the current line string to an integer, base 10.
        const currentNumericalValue = parseInt(lineText, 10) ;

        // Check if the numerical value is perfectly divisible by ten.
        if (currentNumericalValue % 10 === 0)
        {
            return [currentNumericalValue, 10]; // Return the value and 10
        }
        else
        {
            // Otherwise, return the value and its remainder when divided by 10.
            return [currentNumericalValue, currentNumericalValue % 10];
        }
    });

    // Sort the generated pairs based on their second element in ascending order.
    numericCalculations.sort((firstPair, secondPair) => firstPair[1] - secondPair[1]);

    // Initialize an accumulator for the final computed sum.
    let totalAccumulator = 0;

    // Iterate through the sorted numerical pairs to calculate the final sum.
    numericCalculations.forEach((currentElement, elementIndex) => {
        // For the very first element in the sorted list:
        if (elementIndex === 0)
        {
            totalAccumulator += currentElement[0]; // Add its original numerical value directly.
        }
        // For all subsequent elements:
        else
        {
            // Add its numerical value rounded up to the nearest multiple of ten.
            totalAccumulator += Math.ceil(currentElement[0] / 10) * 10;
        }
    });

    // Output the final accumulated sum to the console.
    console.log(totalAccumulator);
}

// Entry point: Read data from standard input and pass it to the processing function.
// Using a distinct name for the 'fs' module import.
const ioManager = require('fs');
processInputData(ioManager.readFileSync('/dev/stdin', 'utf8'));