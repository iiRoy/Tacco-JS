// A utility function to determine if a given sequence consists of only one type of color.
// This check is crucial for identifying a solved state in our puzzle,
// where all elements in the sequence are of the same color (e.g., "000", "1111", "22").
const isUniformColorSequence = (sequenceCandidate) => {
    // Regular expression to test if the sequence contains only 0s, or only 1s, or only 2s.
    // The `+` ensures at least one character, and `^...$` ensures the entire string matches.
    return /^(0+|1+|2+)$/.test(sequenceCandidate);
};

// Helper function to calculate the 'third' color when two colors are mixed.
// In a system where colors are represented by 0, 1, and 2, if you have two distinct colors,
// the third color is simply the sum (0+1+2=3) minus the sum of the two given colors.
// For example:
// - If colors are 0 and 1, the new color is 3 - (0 + 1) = 2.
// - If colors are 0 and 2, the new color is 3 - (0 + 2) = 1.
// - If colors are 1 and 2, the new color is 3 - (1 + 2) = 0.
const deriveMissingColor = (firstColorChar, secondColorChar) => {
    // Ensure inputs are treated as numbers for arithmetic operations.
    return 3 - Number(firstColorChar) - Number(secondColorChar);
};

// This function implements a Breadth-First Search (BFS) algorithm
// to find the minimum number of operations required to transform an
// initial color sequence into a uniform (monochromatic) sequence.
// Each operation involves identifying two adjacent *different* colors and
// changing both of them to the 'third' color (the one not present in the pair).
const findMinimumOperations = (initialColorSequence) => {
    // Input validation: If the sequence is null, undefined, or empty,
    // it's an invalid starting state for the puzzle.
    if (!initialColorSequence || initialColorSequence.length === 0) {
        // As per problem requirements for no solution or invalid state.
        return "NA";
    }

    // Optimization: If the starting sequence is already uniform, zero operations are needed.
    // This is an immediate solution and avoids unnecessary BFS traversal.
    if (isUniformColorSequence(initialColorSequence)) {
        return 0;
    }

    // A queue to manage states to be processed in a breadth-first manner.
    // Each element in the queue is an array: [current_sequence_string, operations_count].
    const stateProcessingQueue = [];
    // A map to keep track of visited sequences. This prevents cycles (re-processing the same state)
    // and ensures that we find the shortest path by avoiding redundant computations.
    // Keys are sequence strings, and values are booleans (true indicating it has been visited).
    const visitedConfigurations = new Map();

    // Initialize the BFS: Add the starting sequence to the queue with zero operations.
    stateProcessingQueue.push([initialColorSequence, 0]);
    // Mark the initial sequence as visited.
    visitedConfigurations.set(initialColorSequence, true);

    // Continue BFS as long as there are states to process in the queue.
    // The loop terminates when a solution is found or when all reachable states have been explored.
    while (stateProcessingQueue.length > 0) {
        // Dequeue the current state: its sequence string and the number of steps taken to reach it.
        const [currentSequence, currentStepCount] = stateProcessingQueue.shift();

        // Iterate through all adjacent pairs of characters in the current sequence.
        // We only need to check up to the second-to-last element, as `idx + 1` covers the last.
        for (let idx = 0; idx < currentSequence.length - 1; ++idx) {
            const charA = currentSequence[idx];
            const charB = currentSequence[idx + 1];

            // Core rule: An operation can only be performed if the adjacent characters are different.
            // If they are the same, no change is possible with this pair; move to the next.
            if (charA === charB) {
                continue;
            }

            // To modify the sequence, convert the string into a mutable array of characters.
            const characterArray = currentSequence.split("");

            // Calculate the new color that results from mixing charA and charB.
            // This 'new color' will replace both charA and charB in the operation.
            const replacementColor = deriveMissingColor(charA, charB);

            // Apply the color change: update the adjacent characters in the array to the new color.
            characterArray[idx] = replacementColor.toString();
            characterArray[idx + 1] = replacementColor.toString();

            // Reconstruct the new sequence string from the modified array.
            const nextConfiguration = characterArray.join("");

            // Before adding to the queue, check if this new configuration has been visited.
            // We only explore new, unvisited configurations.
            if (!visitedConfigurations.has(nextConfiguration)) {
                // If the newly generated configuration is uniform, we've found the solution!
                // Return the current step count plus one (for the operation just performed).
                if (isUniformColorSequence(nextConfiguration)) {
                    return currentStepCount + 1;
                }

                // If the new configuration is not yet uniform, add it to the queue for further exploration.
                stateProcessingQueue.push([nextConfiguration, currentStepCount + 1]);
                // Mark this new configuration as visited to avoid re-processing it later.
                visitedConfigurations.set(nextConfiguration, true);
            }
        }
    }

    // If the queue becomes empty and no uniform sequence was found, it means
    // the target state (a uniform sequence) is unreachable from the initial sequence.
    return "NA";
};

// --- Main Program Execution Block ---

// Standard Node.js library for file system operations, required for reading input from /dev/stdin.
const fileSystem = require('fs');

// Read the entire input from standard input, decoding it as UTF-8.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: first trim any leading/trailing whitespace from the whole input,
// then split it into an array of strings, where each string represents a line of input.
const inputLines = rawInputData.trim().split("\n");

// Function to convert 'r', 'g', 'b' characters in an input string
// to their numerical representations '0', '1', '2' respectively.
// This standardizes the color representation for the BFS algorithm.
const normalizeColorString = (inputStr) => {
    // Use a replacer function with a single regular expression to efficiently
    // convert all 'r', 'g', 'b' characters in the string.
    return inputStr.replace(/[rgb]/g, (char) => {
        switch (char) {
            case 'r': return '0'; // Red becomes 0
            case 'g': return '1'; // Green becomes 1
            case 'b': return '2'; // Blue becomes 2
            default: return char; // Should not be reached with the current regex, but good for robustness.
        }
    });
};

// Loop through each line of input provided.
// We use a `lineIndex` to iterate, allowing us to check for the termination signal.
let lineIndex = 0;
while (lineIndex < inputLines.length) {
    // Get the current line of input and trim any whitespace.
    let currentPuzzleInput = inputLines[lineIndex].trim();

    // The problem specifies "0" as the termination signal for input processing.
    // If this line is "0", we stop processing further inputs.
    if (currentPuzzleInput === "0") {
        break; // Exit the loop.
    }

    // Convert the 'r', 'g', 'b' color string from the input line
    // to the standardized numerical '0', '1', '2' format.
    const numericColorSequence = normalizeColorString(currentPuzzleInput);

    // Call the BFS function to find the minimum operations for the current puzzle.
    // The `findMinimumOperations` function directly returns the calculated result or "NA".
    const minimumOperationsResult = findMinimumOperations(numericColorSequence);

    // Output the result to the console for the current puzzle.
    console.log(minimumOperationsResult);

    // Move to the next line of input for the next iteration.
    lineIndex++;
}