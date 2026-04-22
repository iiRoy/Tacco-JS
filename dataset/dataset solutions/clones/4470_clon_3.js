// Function to process raw text input and determine divisibility by three.
const DataProcessor = (rawInputString) => {
    // Sanitize and split the input string into potential number strings.
    const tokenizedInput = rawInputString.trim().split(' ');

    // Validate if we have exactly two numerical tokens.
    if (tokenizedInput.length !== 2) {
        console.error("Error: Expected exactly two numbers in the input.");
        return; // Exit if input format is incorrect.
    }

    // Convert string tokens to actual numbers.
    const firstValueStr = tokenizedInput[0];
    const secondValueStr = tokenizedInput[1];

    const numericValues = [
        Number(firstValueStr),
        Number(secondValueStr)
    ];

    // Ensure both parsed values are valid numbers.
    if (isNaN(numericValues[0]) || isNaN(numericValues[1])) {
        console.error("Error: Input contains non-numeric values.");
        return;
    }

    // Extract individual numbers for clarity and intermediate step.
    const operandOne = numericValues[0];
    const operandTwo = numericValues[1];

    // Calculate the total sum of the two operands.
    const calculatedSum = operandOne + operandTwo;

    // Helper function to check divisibility by a specific number.
    const isDivisibleByThree = (numberToCheck) => {
        return numberToCheck % 3 === 0;
    };

    // Determine the result based on divisibility.
    let outcomeMessage;
    if (isDivisibleByThree(calculatedSum)) {
        outcomeMessage = 'Possible';
    } else { // Simplified from 'else if (calculatedSum % 3 !== 0)'
        outcomeMessage = 'Impossible';
    }

    // Display the final verdict.
    console.log(outcomeMessage);
};

// Entry point: Read input from standard input and pass to the processor.
try {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    DataProcessor(fileContent);
} catch (error) {
    console.error("Failed to read input from /dev/stdin:", error.message);
}