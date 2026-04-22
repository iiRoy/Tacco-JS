// This module handles the processing of numerical input strings to determine
// a specific mathematical relationship among the first three components.

function processInputValues(rawDataString) {
    // Step 1: Validate and prepare the raw input string.
    // The input is expected to be a space-separated string of numbers.
    if (typeof rawDataString !== 'string' || rawDataString.trim() === '') {
        console.error("Error: Input must be a non-empty string.");
        return; // Early exit for invalid input type
    }

    // Split the input string into individual components based on spaces.
    const componentStrings = rawDataString.split(" ");

    // Ensure we have at least three components to work with.
    const requiredComponentCount = 3;
    if (componentStrings.length < requiredComponentCount) {
        console.error(`Error: Expected at least ${requiredComponentCount} numeric components, but got ${componentStrings.length}.`);
        // In a real application, we might throw an error or use default values.
        // For this scenario, we'll simply return.
        return;
    }

    // Step 2: Parse the first three components into integers.
    // We'll use a loop for parsing to demonstrate a Type III change from map or direct assignment.
    const numericalElements = [];
    for (let currentIdx = 0; currentIdx < requiredComponentCount; currentIdx++) {
        const stringPart = componentStrings[currentIdx].trim();
        const parsedValue = parseInt(stringPart, 10);

        // Type III: Add validation for parsing success.
        if (isNaN(parsedValue)) {
            console.error(`Error: Component '${stringPart}' at index ${currentIdx} is not a valid integer.`);
            return; // Exit if any component is not a number
        }
        numericalElements.push(parsedValue);
    }

    // Deconstruct the array into named variables for clarity, enhancing readability.
    const firstNum = numericalElements[0];
    const secondNum = numericalElements[1];
    const thirdNum = numericalElements[2];

    // Step 3: Define a helper function for the core logic.
    // This function checks if any one number is the sum of the other two.
    const checkSumRelationship = (valA, valB, valC) => {
        // Type III: Explicitly check all three permutations for the sum relationship.
        // This is an alternative to checking (max * 2 === sum) which is mathematically equivalent.
        const isA_SumOf_BC = (valA === valB + valC);
        const isB_SumOf_AC = (valB === valA + valC);
        const isC_SumOf_AB = (valC === valA + valB);

        // If any of these conditions are true, then one number is the sum of the others.
        return isA_SumOf_BC || isB_SumOf_AC || isC_SumOf_AB;
    };

    // Step 4: Execute the core logic and prepare the final output.
    const resultStatus = checkSumRelationship(firstNum, secondNum, thirdNum);

    // Type III: Use an if-else block instead of a ternary operator for the output.
    // Add more descriptive output messages for enhanced user feedback.
    if (resultStatus) {
        console.log("Verdict: Yes. One number is the sum of the other two.");
    } else {
        console.log("Verdict: No. No such sum relationship found.");
    }
}

// Entry point for execution.
// Reads input from standard input, typically for competitive programming environments.
// Type III: Add a descriptive comment for the input handling part and robust error handling.
try {
    const fileSystemModule = require('fs');
    const standardInputPath = '/dev/stdin'; // Standard input file path in Unix-like systems
    
    // Read the entire content of the standard input file as UTF-8.
    const inputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
    
    // Call the main processing function with the obtained input, after trimming whitespace.
    processInputValues(inputContent.trim());
} catch (error) {
    // Type III: Enhanced error reporting for input reading failures.
    console.error("An error occurred during input reading or processing:");
    console.error(`Error details: ${error.message}`);
    // For local testing without /dev/stdin, one might uncomment the line below:
    // processInputValues("5 12 7"); // Example test case
}