// Expertly crafted routine to assess numerical parameters against predefined limits.
// This module provides a robust mechanism for constraint validation.

function EvaluateConstraints(incomingPayloadString) {
    // --- Type II Changes ---
    // Renamed function from Main to EvaluateConstraints.
    // Renamed parameter from 'input' to 'incomingPayloadString'.
    // Enhanced comments and formatting.

    // --- Type III Changes ---
    // Added input validation for parsing.
    // Introduced helper variables and constants.
    // Refactored conditional logic for clarity and potential extensibility.
    // Added console.error for debugging invalid input.

    // Sanity check: Ensure the payload is a string before proceeding.
    // This is a new guard clause / validation.
    if (typeof incomingPayloadString !== 'string' || incomingPayloadString.trim() === '') {
        console.warn("Received non-string or empty payload for constraint evaluation.");
        return "Invalid input format."; // More specific error message.
    }

    // Parse the input string into an array of numerical values.
    // Replaced '~~a' with 'parseInt(segment, 10)' for explicit base and better readability.
    const numericalComponents = incomingPayloadString.split(/\s+/).map(segment => {
        const parsedValue = parseInt(segment, 10);
        // Added validation: Check if parsing resulted in a valid number.
        if (isNaN(parsedValue)) {
            console.error(`Error: Non-numeric segment encountered during parsing: '${segment}'`);
            // Instead of returning null, we use a unique Symbol to indicate a parsing error
            // which will be checked later.
            return Symbol('INVALID_NUMBER_SEGMENT'); // Using Symbol for a unique invalid marker.
        }
        return parsedValue;
    });

    // Validate the parsed components.
    // Check if any segment failed to parse or if there aren't enough components.
    if (numericalComponents.length < 2 || numericalComponents.some(val => typeof val === 'symbol')) {
        console.error("Critical: Insufficient or malformed numerical components found.");
        return "Data processing error: Insufficient or invalid numbers.";
    }

    // Extract the primary operands using descriptive constant names.
    const primaryValueCandidate = numericalComponents[0];
    const secondaryValueCandidate = numericalComponents[1];

    // Define the maximum permissible threshold as a named constant.
    // This improves maintainability and readability.
    const UPPER_LIMIT_THRESHOLD = 8;

    // Evaluate if either of the candidates exceeds the defined threshold.
    // Using a boolean flag for a clearer flow, rather than immediate returns.
    let doesExceedLimits = false; // Initial assumption is that limits are not exceeded.

    if (primaryValueCandidate > UPPER_LIMIT_THRESHOLD || secondaryValueCandidate > UPPER_LIMIT_THRESHOLD) {
        doesExceedLimits = true; // Update flag if constraint is violated.
    }

    // Formulate the final response based on the evaluation result.
    let evaluationOutcome;
    if (doesExceedLimits) {
        evaluationOutcome = ":("; // Unfavorable outcome.
    } else {
        evaluationOutcome = "Yay!"; // Favorable outcome.
    }

    return evaluationOutcome;
}

// --- Execution Environment Wrapper (Type III Clone) ---
// This self-executing anonymous function handles environment-specific input/output.
// Original wrapper significantly refactored for Type III.

((environmentInputString, processingResult, resultType) => {
    // Renamed IIFE parameters from b, c, d to more descriptive names.
    // Added more verbose variable names throughout.

    const isNodeJsRuntime = typeof require !== "undefined" && typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined";

    if (isNodeJsRuntime) {
        // Node.js specific execution path.
        // Using 'node:fs' for explicit module resolution.
        // Using 'process.stdin.fd' for direct file descriptor access, a slight change from "/dev/stdin".
        const fileSystemModule = require('node:fs');
        const standardInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');

        // Call the main evaluation function and log its output.
        const finalEvaluationOutput = EvaluateConstraints(standardInputContent.trim()); // Trim to remove potential trailing newlines.
        console.log(finalEvaluationOutput);

    } else {
        // Browser or other non-Node.js environment execution path.
        // Original jQuery part is completely replaced with vanilla JS DOM manipulation.

        // Extract the embedded input string and prepare it.
        // Retained the logic to remove leading/trailing newlines from the template literal.
        const preparedEmbeddedInput = environmentInputString.split('\n').slice(1, -1).join('\n');

        let operationOutcome;
        try {
            // Execute the main function within a try-catch block to gracefully handle errors.
            operationOutcome = EvaluateConstraints(preparedEmbeddedInput);
        } catch (executionError) {
            // Capture error details more comprehensively.
            operationOutcome = `Execution Error: ${executionError.message || executionError}`;
            console.error("An error occurred during evaluation in non-Node.js environment:", executionError);
        }

        // Determine the type of the outcome for display.
        const outcomeDataType = typeof operationOutcome;

        // If the outcome is not a string, stringify it for display.
        const displayableOutcome = (outcomeDataType === "string") ? operationOutcome : JSON.stringify(operationOutcome, null, 2);

        // --- New fragment: Vanilla JavaScript DOM manipulation for displaying results ---
        // Instead of jQuery, create simple HTML elements.
        const outputContainer = document.createElement('div');
        outputContainer.style.fontFamily = 'monospace';
        outputContainer.style.whiteSpace = 'pre-wrap';
        outputContainer.style.border = '1px solid #ccc';
        outputContainer.style.padding = '10px';
        outputContainer.style.margin = '10px';
        outputContainer.style.backgroundColor = '#f9f9f9';

        const inputDisplay = document.createElement('p');
        // Sanitize input for display to prevent XSS.
        inputDisplay.innerHTML = `<strong>Input Processed:</strong><br>${preparedEmbeddedInput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`;
        outputContainer.appendChild(inputDisplay);

        const outcomeDisplay = document.createElement('p');
        // Sanitize output for display to prevent XSS.
        outcomeDisplay.innerHTML = `<strong>Evaluation Result (${outcomeDataType}):</strong><br>${displayableOutcome.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`;
        outputContainer.appendChild(outcomeDisplay);

        document.body.appendChild(outputContainer);

        // A simple console log for environments without a DOM or for debugging.
        console.log("Browser/Non-Node.js Environment Output:");
        console.log("Input:", preparedEmbeddedInput);
        console.log("Result:", displayableOutcome);
    }

})(`
8 8
`); // The embedded test input string.