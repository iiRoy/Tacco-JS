'use strict'

// This function processes an input string to compute a specific value.
function calculateResult(
    inputString
) {

    // First, clean the input and convert it into an array of numbers.
    // The original string is trimmed, split by spaces, and each part
    // is explicitly converted to an integer.
    const numericValues = inputString
        .trim()
        .split(' ')
        .map(
            item => parseInt(item, 10)
        );

    // Calculate the final outcome: multiply the first two numbers,
    // divide by two, and then round up to the nearest whole number.
    let finalOutcome = Math.ceil(
            (
                numericValues[0] * numericValues[1]
            ) / 2
        );

    // Display the computed result to the standard output.
    console.log(finalOutcome);

}


// The program starts by reading input from standard input,
// then passes it to the main processing function.
calculateResult(
    require('fs')
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
);