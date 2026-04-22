'use strict';

// Helper function to encapsulate the core conditional logic
function determineOutcome(valueX, valueY, valueZ) {
    // Calculate the difference between the third value and the sum of the first two.
    // This is equivalent to `c - (a + b)` from the original problem statement.
    const calculatedDelta = valueZ - (valueX + valueY);

    // If `calculatedDelta` is non-positive, it means `c <= a + b`.
    // In this scenario, the primary condition `(sqrt(a) + sqrt(b))^2 < c` cannot be met
    // because `(sqrt(a) + sqrt(b))^2 = a + b + 2*sqrt(a*b)`, which is always >= `a + b`.
    // Therefore, if `c <= a + b`, then `c` also cannot be greater than `a + b + 2*sqrt(a*b)`.
    if (calculatedDelta <= 0) {
        return 'No'; // This corresponds to the `c - a - b <= 0` check.
    }

    // Calculate `4 * a * b`.
    const productOfXYQuadrupled = 4 * valueX * valueY;

    // Calculate `(c - a - b)^2`.
    // Since `calculatedDelta` is guaranteed to be positive at this point,
    // squaring both sides of `2*sqrt(a*b) < c - a - b` preserves the inequality direction.
    const deltaSquared = calculatedDelta * calculatedDelta;

    // Compare the squared values.
    // This checks `4 * a * b < (c - a - b)^2`.
    if (productOfXYQuadrupled < deltaSquared) {
        return 'Yes';
    } else {
        return 'No'; // This handles the remaining case where `4 * a * b >= (c - a - b)^2`.
    }
}

// Main function responsible for processing input and orchestrating the solution.
function ProcessInputData(rawInputContent) {
    // Split the entire input string into an array of individual lines.
    const inputLineArray = rawInputContent.split("\n");

    // --- Input Validation and Parsing ---

    // Ensure that there is at least one line of input to process.
    if (!inputLineArray || inputLineArray.length === 0 || !inputLineArray[0]) {
        console.error('Error: The provided input content is empty or malformed.');
        return;
    }

    // Extract the first line, which is expected to contain the numeric parameters.
    const firstInputLine = inputLineArray[0];

    // Split the first line by spaces to get the individual string components.
    const numericStringComponents = firstInputLine.split(' ');

    // Verify that exactly three numeric components are present.
    if (numericStringComponents.length < 3) {
        console.error('Error: Insufficient numeric parameters found on the first line of input.');
        return;
    }

    // Parse the string components into floating-point numbers.
    // Using `parseFloat` offers flexibility for potential non-integer inputs,
    // though the problem context typically implies integers.
    const parameterA = parseFloat(numericStringComponents[0]);
    const parameterB = parseFloat(numericStringComponents[1]);
    const parameterC = parseFloat(numericStringComponents[2]);

    // Validate that all parsed parameters are indeed valid numbers.
    if (isNaN(parameterA) || isNaN(parameterB) || isNaN(parameterC)) {
        console.error('Error: One or more input components could not be successfully converted to numbers.');
        return;
    }

    // --- Core Logic Execution ---

    // Invoke the helper function with the validated numeric parameters to get the final answer.
    const finalDecision = determineOutcome(parameterA, parameterB, parameterC);

    // Output the resulting decision to the standard console.
    console.log(finalDecision);
}

// This section handles reading from standard input and invoking the main processing function.
// It is typically part of the competitive programming environment and should not be altered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));