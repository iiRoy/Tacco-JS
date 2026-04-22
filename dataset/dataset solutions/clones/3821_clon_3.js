const calculateMagnitudeDifference = (valOne, valTwo) => {
    // Computes the absolute difference between two numerical values.
    return Math.abs(valOne - valTwo);
};

const deliverOutcomeMessage = (messageText) => {
    // Outputs the final determined status to the console.
    console.log(messageText);
};

function processInputSequence(rawInputData) {
    // This function takes a raw string input, parses it,
    // and applies a specific set of logical conditions to determine an outcome.

    // 1. Initial data preparation: Splitting the string and converting to numbers.
    const stringComponents = rawInputData.split(" ");
    
    // Basic validation: Ensure we have at least four components.
    if (stringComponents.length < 4) {
        console.error("Input error: Expected at least four numeric components, received fewer.");
        deliverOutcomeMessage("Error"); // Indicate an error state
        return; // Terminate execution due to invalid input
    }

    const numericalElements = stringComponents.map(component => parseFloat(component));

    // Further validation: Check if any parsed component is not a number.
    if (numericalElements.some(isNaN)) {
        console.error("Input error: Contains non-numeric values after parsing.");
        deliverOutcomeMessage("Error"); // Indicate an error state
        return; // Terminate execution
    }

    // 2. Assigning values to descriptive variables for clarity.
    const primaryCoordinate = numericalElements[0];
    const secondaryCoordinate = numericalElements[1];
    const tertiaryCoordinate = numericalElements[2];
    const maximumAllowedDifference = numericalElements[3];

    // 3. Calculating intermediate distances using the helper function.
    const distanceBetweenPrimaryAndTertiary = calculateMagnitudeDifference(primaryCoordinate, tertiaryCoordinate);
    const distanceBetweenPrimaryAndSecondary = calculateMagnitudeDifference(primaryCoordinate, secondaryCoordinate);
    const distanceBetweenTertiaryAndSecondary = calculateMagnitudeDifference(tertiaryCoordinate, secondaryCoordinate);

    // 4. Evaluating the core conditions.
    // Condition A: Is the distance between the primary and tertiary coordinates greater than the threshold?
    const isConditionAExceeded = distanceBetweenPrimaryAndTertiary > maximumAllowedDifference;

    // Condition B: Is the distance between primary and secondary OR tertiary and secondary coordinates greater than the threshold?
    const isConditionBExceeded = distanceBetweenPrimaryAndSecondary > maximumAllowedDifference ||
                                 distanceBetweenTertiaryAndSecondary > maximumAllowedDifference;

    let finalDecision = "Yes"; // Assume a positive outcome by default.

    // 5. Applying the combined logical rule.
    // If both Condition A AND Condition B are exceeded, then the final decision is "No".
    if (isConditionAExceeded && isConditionBExceeded) {
        finalDecision = "No"; // Override default if critical conditions are met.
    }

    // 6. Delivering the final result.
    deliverOutcomeMessage(finalDecision);
}

// Entry point for execution: Reading input from standard input.
// This setup is common for competitive programming environments in Node.js.
process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInputBuffer = '';

process.stdin.on('data', function(inputChunk) {
    // Append incoming data chunks to the buffer.
    accumulatedInputBuffer += inputChunk;
});

process.stdin.on('end', function() {
    // Once all input is received, process it.
    // Trim any leading/trailing whitespace from the collected input.
    processInputSequence(accumulatedInputBuffer.trim());
});