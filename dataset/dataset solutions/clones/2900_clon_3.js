// This module handles the processing of a series of computational tasks based on provided input data.
function processComputationalTasks(rawInputPayload) {
    // Define a constant for the modulo operation to improve readability and maintainability.
    const MODULO_VALUE = 1000003;

    // --- Input Parsing and Validation ---

    // Ensure the input payload is not empty or just whitespace.
    if (!rawInputPayload || rawInputPayload.trim() === '') {
        // In a more robust application, this might throw an error or log a warning.
        // For this context, we'll just exit silently if no input is provided.
        return;
    }

    // Split the entire input string into individual lines.
    const inputLines = rawInputPayload.split("\n");

    // The first line contains the total number of tasks to process.
    let taskCount = parseInt(inputLines[0], 10);

    // Validate the parsed task count to ensure it's a non-negative integer.
    if (isNaN(taskCount) || taskCount < 0) {
        // Handle cases where the task count is invalid.
        console.error("Error: Invalid task count provided. Expected a non-negative integer.");
        return; // Terminate execution if the input is malformed.
    }

    // If there are no tasks specified, there's nothing further to process.
    if (taskCount === 0) {
        return;
    }

    // Parse the subsequent lines into an array of task specifications.
    // Each specification is expected to be an array of three integers: [A, B, C].
    const taskSpecifications = inputLines.slice(1, taskCount + 1).map(lineContent => {
        // Split each line by space and attempt to convert each part to an integer.
        return lineContent.split(" ").map(numericString => {
            const parsedNum = parseInt(numericString, 10);
            if (isNaN(parsedNum)) {
                // Provide a warning if a numeric string cannot be parsed correctly.
                // Depending on requirements, this could also throw an error or use a default value.
                console.warn(`Warning: Could not parse '${numericString}' to an integer. Defaulting to 0 for safety.`);
                return 0; // Fallback value for unparseable numbers.
            }
            return parsedNum;
        });
    });

    // --- Main Task Processing Loop ---

    // Iterate through each task specification that was parsed.
    for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
        const currentTaskSpec = taskSpecifications[taskIndex];

        // Extract parameters for the current task into clearly named variables.
        const initialSeedValue = currentTaskSpec[0];    // Corresponds to 'A' from the problem description
        const incrementStepFactor = currentTaskSpec[1]; // Corresponds to 'B'
        const numberOfIterations = currentTaskSpec[2];  // Corresponds to 'C'

        // Initialize a variable to hold the cumulative result for the current task.
        let currentTaskResult = 0;

        // The calculation only proceeds if there's at least one iteration.
        // If numberOfIterations is 0 or negative, currentTaskResult remains 0, matching original behavior.
        if (numberOfIterations > 0) {
            // For the very first iteration (step 0), the result is just the initial value modulo the constant.
            currentTaskResult = initialSeedValue % MODULO_VALUE;

            // Perform subsequent iterations, applying the multiplication and modulo at each step.
            // The loop starts from the second iteration (currentIteration = 1) because the first (0th)
            // iteration's base value has already been set.
            for (let currentIteration = 1; currentIteration < numberOfIterations; currentIteration++) {
                // Calculate the dynamic term that will be multiplied in the current step.
                // This term is (A + j * B) from the original problem.
                const currentProductTerm = initialSeedValue + (currentIteration * incrementStepFactor);

                // Update the result: (previous_result * current_term) % MODULO_VALUE.
                // The modulo operation is applied at each step to keep numbers manageable.
                currentTaskResult = (currentTaskResult * currentProductTerm) % MODULO_VALUE;
            }
        }
        // Output the final computed result for the current task to standard output.
        console.log(currentTaskResult);
    }
}

// --- Standard Input/Output Handling (boilerplate for competitive programming) ---
// This section is typically kept as-is to interface with the standard input/output streams.
// It reads all data from '/dev/stdin' (standard input) as a UTF-8 string and passes it
// to our primary processing function, 'processComputationalTasks'.
processComputationalTasks(require("fs").readFileSync("/dev/stdin", "utf8"));