'use strict';

/**
 * Main function to process input and generate a sequence of numbers.
 * @param {string} inputData Raw string input, expected to contain a number on the first line.
 */
function processInput(inputData) {
    // Extract the desired number of elements from the initial input line.
    // The input string is split by newline, and the first element is parsed as an integer.
    const extractCount = parseInt(inputData.split('\n')[0], 10);

    // Initialize a dynamic array with a predefined set of starting numerical strings.
    // These are the foundational elements for the sequence generation.
    const generatedValues = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '19', '29', '39', '49', '59', '69', '79', '89', '99', '199'
    ];

    // Define an array containing various digit combinations that will serve as prefixes.
    // These prefixes are concatenated with a growing suffix string to form new numbers.
    const leadingSegments = [
        '2', '3', '4', '5', '6', '7', '8', '9',
        '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'
    ];

    // Initialize the suffix string, which starts with two nines.
    // This string will grow by appending more nines in each outer loop iteration.
    let trailingNines = '99';

    // Begin the primary generation loop. This loop runs a fixed number of times (21 iterations).
    for (
        let outerLoopIndex = 0;
        outerLoopIndex <= 20;
        outerLoopIndex++
    ) {
        // Within each outer iteration, iterate through all defined leading segments.
        for (
            let segmentIndex = 0;
            segmentIndex < leadingSegments.length;
            segmentIndex++
        ) {
            // Concatenate the current leading segment with the current trailing nines string.
            // The resulting string is then added to our collection of generated values.
            generatedValues.push(leadingSegments[segmentIndex] + trailingNines);
        }
        // After processing all leading segments for the current outer loop iteration,
        // append another '9' to the trailing nines string for the next iteration.
        trailingNines += '9';
    }

    // Once all values are generated, extract a subset of them based on 'extractCount'.
    // The extracted values are then joined together into a single string,
    // with each value separated by a newline character.
    const combinedResult = generatedValues
        .slice(0, extractCount)
        .join('\n');

    // Output the final formatted string to the standard console.
    console.log(combinedResult);
}

// Execute the processing function by reading input from standard input.
// The 'fs' module is used to read the file synchronously, and the content
// is decoded as UTF-8 before being passed to 'processInput'.
processInput(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);