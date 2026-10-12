var valueContainer;

function performOperation(sourceIdx, destIdx) {
    let currentSourceValue = valueContainer[sourceIdx];

    // Check if the current value is odd and decrement if true
    const isOdd = (currentSourceValue % 2 !== 0);
    if (isOdd) {
        currentSourceValue--;
    }

    // Update the source index with the potentially modified value
    valueContainer[sourceIdx] = currentSourceValue;

    // Divide the source value by two
    const dividedSourceValue = valueContainer[sourceIdx] / 2;
    valueContainer[sourceIdx] = dividedSourceValue;

    // Add the (now divided) source value to the destination index
    valueContainer[destIdx] = valueContainer[destIdx] + valueContainer[sourceIdx];
}

function processInputAndCalculate(rawData) {
    // Step 1: Extract the first line from the raw input string
    const allLines = rawData.split('\n');
    const initialLine = allLines[0];

    // Step 2: Split the first line by whitespace to get string tokens
    // Using /\s/ to match original behavior for handling multiple spaces
    const numberStringTokens = initialLine.split(/\s/);

    // Step 3: Convert string tokens to numbers and initialize the global array
    const initialNumericValues = numberStringTokens.map(Number);
    valueContainer = initialNumericValues;

    // Step 4: Determine the number of iterations from the third element
    const totalIterations = valueContainer[2];

    // Step 5: Loop through the specified number of iterations
    for (let currentIteration = 1; currentIteration <= totalIterations; currentIteration++) {
        // Step 6: Apply conditional logic based on iteration parity
        const isCurrentIterationOdd = (currentIteration % 2 !== 0);

        if (isCurrentIterationOdd) {
            // If iteration is odd, perform operation on indices 0 and 1
            performOperation(0, 1);
        } else {
            // If iteration is even, perform operation on indices 1 and 0
            performOperation(1, 0);
        }
    }

    // Step 7: Print the final values of the first two elements
    console.log(`${valueContainer[0]} ${valueContainer[1]}`);
}

// Setup for reading input from standard input
const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const inputEncoding = 'utf8';

// Read the file content
const fileContent = fileSystemModule.readFileSync(standardInputPath, inputEncoding);

// Execute the main processing function with the file content
processInputAndCalculate(fileContent);
