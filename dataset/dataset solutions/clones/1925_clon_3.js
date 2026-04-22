// This utility processes input data to determine a specific mathematical maximum value
// based on parameters provided in the input string.
function ProcessInputData(receivedText) {
    // Initialize a variable to hold the highest calculated value found during the process.
    let ultimateMaximum = 0;

    // Prepare the raw text input: remove any surrounding whitespace and then segment it into an array of lines.
    // Using a regex for split ensures compatibility with both '\n' and '\r\n' line endings.
    const inputLines = receivedText.trim().split(/\r?\n/);

    // Parse the first line of input, which is expected to contain three space-separated numerical parameters.
    // The `map(Number)` function efficiently converts each string segment into a numerical type.
    const numericParameters = inputLines[0].split(' ').map(Number);

    // Assign the extracted numerical values to clearly named constants for better readability.
    // `paramAlpha` corresponds to the original 'A'.
    const paramAlpha = numericParameters[0];
    // `paramBeta` corresponds to the original 'B'.
    const paramBeta = numericParameters[1];
    // `iterationLimit` sets the upper bound for the main loop, corresponding to 'N'.
    const iterationLimit = numericParameters[2];

    // Introduce a counter to track consecutive iterations where the `ultimateMaximum` does not improve.
    let stagnationCounter = 0;

    // Define a constant for the maximum allowable non-improving iterations. This acts as a heuristic safeguard
    // against excessively long computations, mimicking the original 'p > 30' logic.
    const MAX_STAGNATION_THRESHOLD = 30;

    // Implement a pre-check (guard clause) for `paramBeta` to prevent division by zero errors.
    // While competitive programming usually guarantees valid inputs, this adds robustness.
    if (paramBeta === 0) {
        console.log(0); // If B is zero, the result is trivially zero or undefined, outputting 0 is a safe default.
        return; // Exit the function immediately.
    }
    
    // Begin iterating downwards from `iterationLimit` to 1.
    // This `for` loop replaces the original `while` loop structure, providing a more compact iteration syntax.
    for (let currentVal = iterationLimit; currentVal > 0; --currentVal) {
        // Calculate the remainder of `currentVal` when divided by `paramBeta`.
        // This intermediate step is crucial for the simplified mathematical expression.
        const remainder = currentVal % paramBeta;

        // Compute the primary mathematical expression.
        // The original calculation `Math.floor(A * cnt / B) - A * Math.floor(cnt / B)`
        // is mathematically equivalent to `Math.floor(A * (cnt % B) / B)` for positive integers.
        // This rewritten form enhances clarity and potentially efficiency.
        const evaluatedResult = Math.floor((paramAlpha * remainder) / paramBeta);

        // Check if the `evaluatedResult` from the current iteration surpasses the `ultimateMaximum` found so far.
        if (ultimateMaximum < evaluatedResult) {
            ultimateMaximum = evaluatedResult; // Update the maximum if a larger value is found.
            stagnationCounter = 0; // Reset the stagnation counter upon finding an improvement.
            // Crucially, the original code immediately breaks the loop here.
            // This peculiar behavior implies the problem expects the maximum to be found quickly or
            // that the function is expected to be non-increasing from N downwards after its peak.
            break; 
        } else {
            // If the current result does not improve the maximum, increment the stagnation counter.
            stagnationCounter++;
            // If the counter exceeds the predefined threshold, terminate the loop prematurely.
            // This prevents excessive iterations if no new maximum is found for a prolonged period.
            if (stagnationCounter > MAX_STAGNATION_THRESHOLD) {
                break;
            }
        }
    }

    // Output the final `ultimateMaximum` value obtained from the processing.
    console.log(ultimateMaximum);
}

// --- Standard Input/Output Mechanism (DO NOT MODIFY BELOW THIS LINE FOR CONTEST SUBMISSION) ---
// This section handles reading input from the standard input stream and invoking the main processing function.
// It is typically provided by the online judge environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
// The following line is commented out but can be used for local testing by reading from an 'input.txt' file.
// ProcessInputData(require('fs').readFileSync('./input.txt', 'utf-8'));