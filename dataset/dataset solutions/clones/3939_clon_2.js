"use strict";

// This function processes raw input data to calculate aggregated travel costs.
function processInputData(
    rawData
) {

    // Split the entire input string by newline characters into an array of lines.
    rawData = rawData.split('\n');

    // Extract and parse the value from the first two lines for the initial travel segment.
    // Note: parseInt on an array concatenates elements with commas, then parses the start.
    const firstSegmentValue = Number.parseInt(
        rawData.slice(0, 2)
    );

    // Extract and parse the value from the last two lines for the final travel segment.
    const lastSegmentValue = Number.parseInt(
        rawData.slice(-2)
    );


    // Calculate the minimum cost for the first segment.
    // Note: Spreading a single number (e.g., 10) results in Math.min(1, 0) which is 0.
    const minimumFirstCost = Math.min(
        ...firstSegmentValue
    );

    // Calculate the minimum cost for the last segment.
    const minimumLastCost = Math.min(
        ...lastSegmentValue
    );


    // Display the combined total of the two minimum costs.
    console.log(
        minimumFirstCost + minimumLastCost
    );
}

// Read the entire content of the standard input file and pass it to the processing function.
processInputData(
    require('node:fs').readFileSync('/dev/stdin', 'utf8')
);