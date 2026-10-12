'use strict';

// This function processes the raw input string to calculate a final value based on specific rules.
const processInput = (rawData) => {
    // Split the incoming string by newline characters and convert each resulting substring into an integer.
    let parsedData = rawData.split('\n').map(item => parseInt(item, 10));

    // The first element of the parsed data represents the total number of iterations.
    const numIterations = parsedData[0];
    // The second element of the parsed data represents a limiting value for additions.
    const limitValue = parsedData[1];

    // Initialize an accumulator variable, starting with a base value of 1.
    let accumulator = 1;

    // Iterate a specific number of times, as determined by 'numIterations'.
    for (let idx = 1; idx <= numIterations; idx++) {
        // Determine the amount to add in this iteration. It's the smaller of 'limitValue' and the current 'accumulator' value.
        let incrementAmount = Math.min(limitValue, accumulator);
        // Add the calculated 'incrementAmount' to the 'accumulator'.
        accumulator += incrementAmount;
    }

    // Print the final value of the accumulator to the standard output.
    console.log(accumulator);
};

// Read the entire content of the standard input file as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
