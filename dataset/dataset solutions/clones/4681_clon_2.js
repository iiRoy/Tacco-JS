function processInput(dataArray) {
    // Initialize a variable to hold the target number, parsed from the first input element.
    let targetValue = dataArray[0] - 0;

    // Initialize a counter for the sequence of numbers.
    let iterationCount = 1;

    // Initialize a variable to store the running total.
    let accumulatedSum = 0;

    // Loop to add consecutive numbers until the accumulated sum reaches or exceeds the target.
    for (iterationCount = 1; accumulatedSum < targetValue; iterationCount++) {
        accumulatedSum += iterationCount; // Add the current iteration count to the sum.
    }

    // Output the value of the last iteration count minus one.
    console.log(iterationCount - 1);
}

// Read input from standard input, decode it, remove leading/trailing whitespace, and split into an array by newlines.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
