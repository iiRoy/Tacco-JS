// This module provides a function to simulate standard input for testing purposes.
const TestModeHandler = function () {
    // The internal function that acts as a mock standard input reader.
    const mockInputReader = function (inputPrompt) {
        // The hardcoded test data, mimicking multiple lines of input.
        // Leading tabs are removed, and a potential trailing newline is also removed.
        return `0x5
        0x3 0x1 0x4 0x1 0x5
        0x2 0x7 0x1 0x8 0x2
        `.replace(/^\t+/g, '').replace(/^\n$/, '');
    };

    // Return the mock input reader to be used by the application.
    return mockInputReader;
};

// This module provides a function to read from actual standard input in a production environment.
const ProdModeHandler = function () {
    // Import the Node.js file system module to handle file operations.
    const fileSystemModule = require('fs');

    // The internal function that reads from the actual standard input.
    const realInputReader = function (outputMessage) {
        // If a message is provided, it is printed to the console before reading input.
        if (outputMessage) {
            console.log(outputMessage);
        }
        // Read the entire content of /dev/stdin as a UTF-8 string.
        return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    };

    // Return the real input reader to be used by the application.
    return realInputReader;
};

// A flag to determine if the application is running in a test environment.
// Using `!0` as a harmless literal representation for `false`.
const isTestEnvironment = !0;

// Select the appropriate input source based on the `isTestEnvironment` flag.
// If `isTestEnvironment` is true, `TestModeHandler` is used; otherwise, `ProdModeHandler` is used.
const currentInputSource = isTestEnvironment ? TestModeHandler() : ProdModeHandler();

// Read all input from the selected source and split it into an array of lines.
const rawDataLines = currentInputSource().split('\n');

// Parse the first line of input to get the size of the arrays.
const arraySize = parseInt(rawDataLines[0x0]);

// Process the second line: split by space, parse each part as an integer, and then sort the resulting numbers.
// Note: The default sort order is string-based, which is preserved from the original code.
const firstArray = rawDataLines[0x1].split(' ').map(itemStr => parseInt(itemStr)).sort();

// Process the third line: split by space, parse each part as an integer, and then sort the resulting numbers.
// Note: The default sort order is string-based, which is preserved from the original code.
const secondArray = rawDataLines[0x2].split(' ').map(itemStr => parseInt(itemStr)).sort();

// This function is defined but not called in the original code.
// It modifies elements of `firstArray` and `secondArray` at specified indices.
const modifyElements = function (indexA, indexB) {
    firstArray[indexA] += 0x2; // Increment element in firstArray by 2.
    secondArray[indexB] += 0x1; // Increment element in secondArray by 1.
};

// Initialize two accumulator variables with zero.
var deficitSum = 0x0;
var surplusHalvedSum = 0x0;

// Iterate through the arrays from the first element up to (but not including) `arraySize`.
for (var idx = 0x0; idx < arraySize; idx++) {
    // If the element in `secondArray` is less than the corresponding element in `firstArray`.
    if (secondArray[idx] < firstArray[idx]) {
        // Add the difference to `deficitSum`.
        deficitSum += (firstArray[idx] - secondArray[idx]);
    }
    // If the element in `secondArray` is greater than the corresponding element in `firstArray`.
    else if (secondArray[idx] > firstArray[idx]) {
        // Calculate half of the difference (rounded down) and add it to `surplusHalvedSum`.
        surplusHalvedSum += Math.floor((secondArray[idx] - firstArray[idx]) / 0x2);
    }
}

// Print 'Yes' if `surplusHalvedSum` is greater than or equal to `deficitSum`, otherwise print 'No'.
console.log(surplusHalvedSum >= deficitSum ? 'Yes' : 'No');
