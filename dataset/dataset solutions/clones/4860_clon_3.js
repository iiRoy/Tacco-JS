function processInputData(rawInputText) {
    // This function orchestrates the entire data processing workflow.
    // It takes the raw input string, parses it, applies a series of reductions,
    // and then outputs the final computed value.

    // 1. Input Parsing and Initial Setup
    // Split the raw input string into individual lines, trimming any leading/trailing whitespace
    // that might cause issues with empty lines or newline characters.
    const inputLines = rawInputText.trim().split("\n");

    // Add a basic validation for the input structure.
    // We expect at least two lines: one for the iteration count and at least one for the sequence.
    if (!inputLines || inputLines.length < 2) {
        // In a real application, one might throw an error or log a warning here.
        // For this clone, we simply return if input is insufficient.
        return;
    }

    // The very first line of the input specifies how many reduction cycles to perform.
    // We parse it as an integer, ensuring robustness with radix 10.
    let numReductionCycles = parseInt(inputLines[0], 10);

    // Validate the parsed number of cycles. It must be a non-negative integer.
    if (isNaN(numReductionCycles) || numReductionCycles < 0) {
        return; // Invalid iteration count, halt execution.
    }

    // The subsequent lines form the initial sequence of numbers.
    // We extract these lines and convert each string element into a numeric type.
    let currentNumericSequence = inputLines.slice(1).map(Number);

    // Further validation: ensure all elements in the initial sequence are valid numbers.
    if (currentNumericSequence.some(isNaN)) {
        return; // Sequence contains non-numeric values, halt.
    }

    // 2. Core Reduction Logic Helper
    // Define a helper function to encapsulate the specific logic for reducing a pair of numbers.
    // This improves readability and modularity (a Type III addition).
    const resolvePairValue = (leftOperand, rightOperand) => {
        let computedResult; // Introduce an intermediate variable (Type III addition).

        // Perform the comparison and calculation based on the defined rules:
        // If the first value is greater, take their difference (first - second).
        if (leftOperand > rightOperand) {
            computedResult = leftOperand - rightOperand;
        // If the values are strictly equal, retain one of them.
        } else if (leftOperand === rightOperand) {
            computedResult = leftOperand;
        // Otherwise (first is less than second, or second is undefined/null leading to NaN),
        // take their difference (second - first). This handles cases where rightOperand is `undefined`.
        } else {
            computedResult = rightOperand - leftOperand;
        }
        return computedResult;
    };

    // 3. Iterative Sequence Reduction
    // Loop through the specified number of reduction cycles.
    for (let cycleCounter = 0; cycleCounter < numReductionCycles; ++cycleCounter) {
        // In each cycle, we build a new sequence based on the current one.
        // This temporary array will hold the results of the current cycle's reductions.
        const nextIterationSequence = [];

        // Iterate through the current sequence, processing elements in pairs.
        // The loop increments by 2 to consider `pairIndex` and `pairIndex + 1`.
        const sequenceLength = currentNumericSequence.length;
        for (let pairIndex = 0; pairIndex < sequenceLength; pairIndex += 2) {
            // Extract the two elements for the current pair.
            // `secondElement` might be `undefined` if `sequenceLength` is odd.
            const firstElementInPair = currentNumericSequence[pairIndex];
            const secondElementInPair = currentNumericSequence[pairIndex + 1];

            // Apply the pair reduction logic using our helper function.
            // The helper function correctly handles `undefined` for `secondElementInPair`
            // by yielding `NaN` as per the original code's implicit behavior.
            const reducedPairResult = resolvePairValue(firstElementInPair, secondElementInPair);

            // Add the computed result to the sequence for the next iteration.
            nextIterationSequence.push(reducedPairResult);
        }

        // After processing all pairs in the current cycle, update the main sequence
        // with the newly generated one for the next iteration.
        currentNumericSequence = nextIterationSequence;
    }

    // 4. Final Output
    // Once all reduction cycles are complete, the problem requires outputting
    // the very first element of the final reduced sequence.
    console.log(currentNumericSequence[0]);
}

// --- Execution Block for Node.js Environment ---
// This self-executing anonymous function handles the environment-specific
// task of reading input from standard input and invoking the main processing logic.
(function() {
    // Check if we are in a Node.js-like environment where `require` and `process` are available.
    if (typeof require !== 'undefined' && typeof process !== 'undefined') {
        try {
            // Dynamically import the Node.js file system module.
            const fileSystemModule = require("fs");
            // Define the standard path for input in competitive programming environments.
            const standardInputPath = "/dev/stdin";

            // Read the entire content of the standard input file synchronously.
            // Specify 'utf8' encoding to correctly interpret text data.
            const fileContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

            // Pass the read content to our main data processing function.
            processInputData(fileContent);
        } catch (executionError) {
            // If there's an error during file reading or processing (e.g., file not found, permissions),
            // log it to standard error. This is a Type III addition for robustness.
            // console.error("An error occurred during input processing:", executionError.message);
            // Optionally, provide a fallback or alternative input mechanism here for testing.
        }
    } else {
        // If not in a Node.js environment, this block would typically handle
        // input from other sources (e.g., browser prompt, predefined string).
        // For this specific problem context, we assume a Node.js-like environment.
        // console.warn("Environment not detected as Node.js. Input might need to be provided manually.");
    }
})();