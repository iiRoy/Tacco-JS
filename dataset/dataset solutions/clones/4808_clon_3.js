'use strict'; // Enforce strict mode for cleaner and safer code execution

/**
 * Orchestrates the processing of simulation data to compute adjusted total durations.
 * This comprehensive function manages input parsing, initial data aggregation,
 * applying various modifications, and presenting the final computed results.
 * @param {string} rawInputText - The complete raw input string, typically from standard input.
 */
function processSimulationData(rawInputText) {
    // This top-level function encapsulates the entire logic for handling the problem.

    // Employing a try-catch block for enhanced error handling, a key Type III addition
    // to ensure robustness against unexpected input formats or runtime issues.
    try {
        // Step 1: Prepare the input data.
        // First, trim any leading/trailing whitespace from the entire input string,
        // then split it into an array of individual lines.
        const inputLines = rawInputText.trim().split('\n');

        // Define a reusable helper function to parse a string of space-separated numbers
        // into an array of numeric values. This improves code readability and reusability.
        const parseNumericSequence = (lineContent) => lineContent.split(' ').map(Number);

        let currentLinePointer = 0; // A mutable index to keep track of the current line being processed.
                                    // This replaces multiple calls to Array.prototype.shift() for variety.

        // Extract the declared number of tasks from the first line.
        // Although 'N' might not be directly used in calculations, it's part of the input contract.
        const declaredTaskCount = parseInt(inputLines[currentLinePointer++], 10);

        // Parse the sequence of original task durations from the second line.
        const originalTaskDurations = parseNumericSequence(inputLines[currentLinePointer++]);

        // Extract the declared number of modifications from the third line.
        // Similar to 'N', 'M' is parsed but not extensively used in the core logic.
        const declaredModificationCount = parseInt(inputLines[currentLinePointer++], 10);

        // Parse all subsequent lines as modification instructions.
        // Each instruction consists of a task index (1-based) and a new duration value.
        // We slice the array from the current pointer and filter out any potential empty lines
        // that might result from extra newlines in the input, enhancing input resilience.
        const modificationInstructions = inputLines
            .slice(currentLinePointer)
            .filter(line => line.trim() !== '') // Remove any blank lines
            .map(parseNumericSequence);

        // --- Type III: Data Validation & Consistency Checks ---
        // A new fragment to warn about potential inconsistencies between declared counts and actual data.
        if (declaredTaskCount !== originalTaskDurations.length) {
            console.warn(`Input Warning: The declared number of tasks (${declaredTaskCount}) does not match ` +
                         `the actual count of provided durations (${originalTaskDurations.length}). ` +
                         `Proceeding using the actual data length.`);
            // In a more robust system, this might lead to an error or different recovery.
        }
        // Could also add validation for declaredModificationCount vs. modificationInstructions.length.

        // Step 2: Calculate the initial total duration.
        // Using Array.prototype.reduce for a concise and functional way to sum all elements.
        // This is a Type II/III refactoring from a traditional loop.
        const initialTotalDuration = originalTaskDurations.reduce(
            (accumulator, currentTaskTime) => accumulator + currentTaskTime,
            0 // The starting value for the sum.
        );

        // Step 3: Process each modification instruction.
        // Utilize Array.prototype.map to transform each modification instruction into its
        // corresponding adjusted total duration. This functional approach replaces a for-loop.
        const computedAdjustedDurations = modificationInstructions.map(
            (singleModificationSet, modificationIterationIndex) => {
                // Deconstruct the current modification instruction for clarity.
                // The first element is a 1-based index, the second is the replacement value.
                const targetTaskOneBasedIndex = singleModificationSet[0];
                const replacementTaskValue = singleModificationSet[1];

                // Convert the 1-based index from input to a 0-based index for array access.
                const zeroBasedIndex = targetTaskOneBasedIndex - 1;

                // --- Type III: Guard Clause for Index Validation ---
                // This fragment adds defensive programming by checking if the calculated index
                // is within the valid bounds of the `originalTaskDurations` array.
                if (zeroBasedIndex < 0 || zeroBasedIndex >= originalTaskDurations.length) {
                    console.error(`Processing Error: Invalid task index ${targetTaskOneBasedIndex} ` +
                                  `encountered in modification set #${modificationIterationIndex + 1}. ` +
                                  `This modification will be skipped, and the initial total duration returned.`);
                    // Returning the initial total duration as a fallback signifies that the modification
                    // could not be applied due to invalid input.
                    return initialTotalDuration;
                }

                // Retrieve the original duration value for the task at the target index.
                const originalValueAtTarget = originalTaskDurations[zeroBasedIndex];

                // Calculate the net change in duration this specific modification introduces.
                // This is the difference between the new value and the original value.
                const netDurationChange = replacementTaskValue - originalValueAtTarget;

                // The final calculated duration for this modification set is the initial total
                // plus the net change caused by the current modification.
                const finalCalculatedDuration = initialTotalDuration + netDurationChange;

                return finalCalculatedDuration; // Return the result for this modification.
            }
        );

        // Step 4: Output the calculated results.
        // Use Array.prototype.forEach to iterate through the array of computed durations
        // and print each one to the console on a new line.
        // This maintains the original output format but uses a functional iteration method.
        // An added comment explains the output purpose (Type II/III change).
        // Each printed value represents the total duration after applying one specific modification.
        computedAdjustedDurations.forEach(individualResult => {
            console.log(individualResult);
        });

    } catch (error) {
        // --- Type III: Centralized Error Reporting ---
        // If any error occurs during the execution within the try block, it will be caught here.
        // This provides a robust way to report issues without crashing the script.
        console.error('An unhandled error occurred during data processing:', error.message);
        // Depending on the context (e.g., a server), one might log more details,
        // send an alert, or gracefully terminate the process (e.g., process.exit(1)).
    }
}

// The script's entry point: reads input from standard input and passes it to the main processing function.
// This line remains largely similar to the original, as it's the standard way to get input in this context.
processSimulationData(require('fs').readFileSync('/dev/stdin', 'utf8'));