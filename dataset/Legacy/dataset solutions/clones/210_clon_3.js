const fileSystem = require('fs');

// Helper function to read all input lines from stdin
function readAllInputLines() {
    const standardInputFileDescriptor = process.stdin.fd;
    const inputContentSize = fileSystem.fstatSync(standardInputFileDescriptor).size;
    // Allocate a buffer to hold the input data based on its size
    const dataBuffer = Buffer.alloc(inputContentSize);
    // Read the data from stdin into the allocated buffer
    const bytesActuallyRead = fileSystem.readSync(standardInputFileDescriptor, dataBuffer, 0, inputContentSize, 0);
    // Convert the buffer content to a UTF-8 string, trim leading/trailing whitespace, and split into an array of lines
    const rawInputString = dataBuffer.toString('utf8', 0, bytesActuallyRead);
    return rawInputString.trim().split('\n');
}

// Function to pre-calculate the number of trailing zeros for factorials up to a defined maximum
function computeTrailingZeroCounts() {
    const MAXIMUM_VALUE_FOR_FACTORIAL = 20000;
    // Initialize an Int32Array to store the counts.
    // Int32Array elements are automatically initialized to 0, which is correct for 0! through 4!.
    const trailingZeroCountsArray = new Int32Array(MAXIMUM_VALUE_FOR_FACTORIAL + 1);

    // Iterate from 5 up to the maximum value, as factorials below 5! have zero trailing zeros
    for (let currentNumber = 5; currentNumber <= MAXIMUM_VALUE_FOR_FACTORIAL; currentNumber++) {
        let tempNumberForDivision = currentNumber;
        let currentNumberZeroSum = 0; // This variable accumulates the sum for the current factorial's trailing zeros

        // Apply Legendre's formula: sum(floor(N / 5^k)) for k >= 1
        // This loop efficiently calculates floor(currentNumber/5) + floor(currentNumber/25) + ...
        while (tempNumberForDivision >= 5) {
            tempNumberForDivision = Math.floor(tempNumberForDivision / 5); // Divide by 5 and take floor
            currentNumberZeroSum += tempNumberForDivision; // Add the result to the sum
        }
        // Store the total calculated trailing zero count for currentNumber!
        trailingZeroCountsArray[currentNumber] = currentNumberZeroSum;
    }

    return trailingZeroCountsArray;
}

// Main processing function that orchestrates input reading, calculation, and output
function processAndOutputResults() {
    const inputDataLines = readAllInputLines(); // Retrieve all input lines from stdin
    const precomputedZeroCounts = computeTrailingZeroCounts(); // Get the precomputed array of factorial zero counts

    const numberOfInputEntries = inputDataLines.length;
    // Iterate through each line of input
    for (let entryIndex = 0; entryIndex < numberOfInputEntries; entryIndex++) {
        // Convert the current input string to a number using the Number() constructor for explicit type conversion
        const numericInputValue = Number(inputDataLines[entryIndex]);
        // Output the precomputed trailing zero count corresponding to the numeric input value
        console.log(precomputedZeroCounts[numericInputValue]);
    }
}

// Execute the main processing logic to start the program
processAndOutputResults();
