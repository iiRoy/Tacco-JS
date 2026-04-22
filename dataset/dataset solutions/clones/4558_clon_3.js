// This module is designed to evaluate a pair of integer values based on predefined categorizations and specific exclusion rules.
// The primary function orchestrates the parsing of input and the determination of the final outcome.
function ProcessInputData(fullInputString) {
    // Internally split the raw input string into an array of lines.
    // This allows access to individual lines (e.g., incomingPayload[0] for the first line).
    const incomingPayload = fullInputString.split('\n');

    // Establish two distinct collections of numbers for categorization purposes.
    // Using Set objects for efficient membership testing.
    const monthGroupOne = new Set([1, 3, 5, 7, 8, 12]);
    const monthGroupTwo = new Set([4, 6, 9, 11]);

    let finalDecision = "Undetermined"; // Initialize the result with a neutral status.

    // --- Input Validation and Parsing ---

    // Validate that there is at least one line of input data.
    if (!incomingPayload || incomingPayload.length === 0 || typeof incomingPayload[0] !== 'string') {
        console.error("Error: No valid input lines were provided or the first line is not a string.");
        finalDecision = "Input Error";
        console.log(finalDecision);
        return; // Exit if input is fundamentally malformed.
    }

    const firstInputLine = incomingPayload[0].trim(); // Retrieve the first line and remove whitespace.

    // Check if the first line is empty after trimming.
    if (firstInputLine.length === 0) {
        console.error("Error: The primary input line is empty, expected numeric values.");
        finalDecision = "Invalid Input";
        console.log(finalDecision);
        return;
    }

    // Split the first line by spaces to get individual string tokens.
    const stringTokens = firstInputLine.split(" ");

    // Ensure exactly two numerical tokens are present.
    if (stringTokens.length < 2) {
        console.error("Error: Insufficient numerical tokens found in the input line. Expected two values.");
        finalDecision = "Invalid Input";
        console.log(finalDecision);
        return;
    }

    // A reusable utility function to safely parse a string into an integer.
    // It handles non-numeric inputs by returning null.
    const safelyParseInteger = (valueString, positionIdentifier) => {
        const trimmedValue = valueString.trim();
        const parsedNumber = parseInt(trimmedValue, 10);
        if (isNaN(parsedNumber)) {
            console.warn(`Warning: Failed to parse "${trimmedValue}" (position: ${positionIdentifier}) as an integer.`);
            return null; // Indicate a parsing failure.
        }
        return parsedNumber;
    };

    // Parse the two primary numeric values from the tokens.
    const firstNumericVal = safelyParseInteger(stringTokens[0], "first");
    const secondNumericVal = safelyParseInteger(stringTokens[1], "second");

    // Check if both parsing operations were successful.
    if (firstNumericVal === null || secondNumericVal === null) {
        finalDecision = "Parsing Failed"; // Set outcome if any value couldn't be parsed.
    } else {
        // --- Core Logic for Decision Making ---

        // Determine if the forbidden value (2) is present in either input.
        const isForbiddenValueDetected = (firstNumericVal === 2 || secondNumericVal === 2);
        
        // A helper function to check if both provided numbers are members of a given Set.
        const checkBothValuesInSet = (val1, val2, targetSet) => {
            return targetSet.has(val1) && targetSet.has(val2);
        };

        // Evaluate if both values belong to the first category.
        const bothAreInMonthGroupOne = checkBothValuesInSet(firstNumericVal, secondNumericVal, monthGroupOne);
        // Evaluate if both values belong to the second category.
        const bothAreInMonthGroupTwo = checkBothValuesInSet(firstNumericVal, secondNumericVal, monthGroupTwo);

        // Apply the decision rules based on the evaluated conditions.
        if (isForbiddenValueDetected) {
            finalDecision = "No"; // If '2' is present, the result is always "No".
        } else if (bothAreInMonthGroupOne || bothAreInMonthGroupTwo) {
            finalDecision = "Yes"; // If both values are in the same category, the result is "Yes".
        } else {
            finalDecision = "No"; // Otherwise, if no specific conditions are met, the result is "No".
        }
    }
    
    // Output the determined decision to the console.
    console.log(finalDecision);
}

// Do not modify the following line. It handles reading input from stdin and invoking the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));