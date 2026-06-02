const DevelopmentModeHandler = function () {
    // This function provides a mock input for development purposes.
    const mockDataFetcher = function (promptText) {
        // In development, we return a fixed string.
        return '431 321';
    };

    return mockDataFetcher; // Return the mock input function.
};


const ProductionModeHandler = function () {
    // Load the Node.js file system module for reading input.
    const fileSystemModule = require('fs');

    // This function reads actual input from standard input.
    const actualInputReader = function (displayMessage) {
        // If a message is provided, print it to the console.
        if (displayMessage) {
            console.log(displayMessage);
        }
        // Read content from /dev/stdin as UTF-8.
        return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    };

    return actualInputReader; // Return the real input reading function.
};


// A flag to determine if we are in a development environment.
const isDevEnvironment = false;

// Select the appropriate input retrieval mechanism based on the environment flag.
const retrieveInput = isDevEnvironment ? DevelopmentModeHandler() : ProductionModeHandler();

// Fetch input, split by newlines, and convert each part to an integer.
const parsedNumericData = retrieveInput().split('\n').map(strVal => parseInt(strVal, 10));

// Extract the first number from the parsed data.
const firstNumber = parsedNumericData[0];
// Extract the second number from the parsed data.
const secondNumber = parsedNumericData[1];

// Check if the first number is perfectly divisible by the second number.
if (firstNumber % secondNumber === 0) {
    // If it is, print -1 as per the problem's logic.
    console.log(-1);
} else {
    // Otherwise, print the first number.
    console.log(firstNumber);
}
