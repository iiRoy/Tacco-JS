/**
 * @file This script generates a sequence of "run-length" numbers based on a given iteration count.
 * A run-length number is defined such that each subsequent digit differs from the previous one by at most 1.
 * The generation process uses a breadth-first search (BFS) approach.
 *
 * This code represents a Type III clone of an original implementation, featuring:
 * - Extensive renaming of identifiers (variables, functions).
 * - Modified control flow structures (e.g., `for` loop replaced with `while`).
 * - Introduction of helper variables for intermediate calculations.
 * - Dynamic initialization of data structures.
 * - Addition of input validation and guard clauses for robustness.
 * - Rewritten conditional statements and data manipulation logic.
 * - Enhanced output messaging.
 * - Refactored file input mechanism with error handling.
 */

/**
 * Orchestrates the generation of a specific run-length number sequence up to a defined iteration.
 * It processes numbers in a queue-like fashion, extending them by appending digits that are
 * one less, the same, or one greater than their last digit.
 *
 * @param {string} rawIterationInput - The raw string input representing the number of iterations to perform.
 *                                     This value determines how many numbers are dequeued and processed.
 * @returns {number|null} The last number processed from the sequence, or null if no processing occurred.
 */
function sequenceGeneratorMain(rawIterationInput) {
    // --- Input Processing and Validation ---
    let desiredIterationLimit = 0; // Renamed from 'n'

    // Validate and parse the incoming configuration value.
    if (typeof rawIterationInput === 'string' && rawIterationInput.trim().length > 0 && !isNaN(rawIterationInput)) {
        desiredIterationLimit = Number.parseInt(rawIterationInput.trim(), 10);
    } else {
        // Provide a default or handle invalid input gracefully.
        console.error("Warning: Invalid or empty iteration input provided. Defaulting to 1 iteration.");
        desiredIterationLimit = 1; // Fallback value
    }

    // Guard clause: Ensure a positive iteration count.
    if (desiredIterationLimit <= 0) {
        console.info("Info: Iteration count must be positive. No sequence elements will be generated or processed.");
        return null; // Exit early if no work is to be done.
    }

    // --- Data Structure Initialization ---
    // Initialize the primary processing queue with single-digit numbers (1-9).
    // This part is dynamically generated instead of a hardcoded array.
    let generationCandidatesQueue = []; // Renamed from 'queue'
    for (let digitValue = 1; digitValue <= 9; digitValue++) {
        generationCandidatesQueue.push(digitValue);
    }

    let finalProcessedElement = null; // Renamed from 'x'
    let elementsProcessedCounter = 0; // Renamed from 'i' for the loop counter

    // --- Main Sequence Generation Loop ---
    // Using a while loop with an explicit counter instead of a for loop.
    while (elementsProcessedCounter < desiredIterationLimit && generationCandidatesQueue.length > 0) {
        // Dequeue the next number for processing.
        // Using shift() which modifies the array in place.
        const currentNumericalCandidate = generationCandidatesQueue.shift(); // Renamed from 'x'
        finalProcessedElement = currentNumericalCandidate; // Update the variable holding the last processed value.

        // Extract the last digit for subsequent calculations.
        const lastDigitOfCurrentNumber = currentNumericalCandidate % 10;
        // Calculate the base for forming new numbers (current_number * 10).
        const baseForExtendedNumbers = currentNumericalCandidate * 10;

        // Prepare a temporary list to hold newly generated numbers before adding them to the main queue.
        let newNumbersToEnqueue = [];

        // Condition 1: Add a new number by appending (last_digit - 1).
        // This is equivalent to checking if `lastDigitOfCurrentNumber` is not 0.
        if (lastDigitOfCurrentNumber > 0) {
            const decrementedSuffixNumber = baseForExtendedNumbers + (lastDigitOfCurrentNumber - 1);
            newNumbersToEnqueue.push(decrementedSuffixNumber);
        }

        // Condition 2: Always add a new number by appending (last_digit).
        const sameSuffixNumber = baseForExtendedNumbers + lastDigitOfCurrentNumber;
        newNumbersToEnqueue.push(sameSuffixNumber);

        // Condition 3: Add a new number by appending (last_digit + 1).
        // This is equivalent to checking if `lastDigitOfCurrentNumber` is not 9.
        if (lastDigitOfCurrentNumber < 9) {
            const incrementedSuffixNumber = baseForExtendedNumbers + (lastDigitOfCurrentNumber + 1);
            newNumbersToEnqueue.push(incrementedSuffixNumber);
        }

        // Efficiently add all newly generated numbers to the end of the main queue.
        generationCandidatesQueue.push(...newNumbersToEnqueue);

        // Increment the counter for processed elements.
        elementsProcessedCounter++;
    }

    // --- Output Result ---
    // Provide a more descriptive output message.
    if (finalProcessedElement !== null) {
        console.log(`The ${desiredIterationLimit}-th processed element in the sequence is: ${finalProcessedElement}`);
    } else {
        console.log("No valid element was processed or generated due to initial conditions or an empty queue.");
    }

    return finalProcessedElement; // Return the result for potential external use or testing.
}

// --- Execution Block (Mimicking original input reading) ---
// This block handles reading input from stdin and invoking the main generation function.
// It includes error handling for file system operations.
try {
    // Using 'node:fs' for explicit Node.js module import.
    const fileInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    sequenceGeneratorMain(fileInputContent);
} catch (filesystemError) {
    console.error("Failed to read input from /dev/stdin:", filesystemError.message);
    // As a fallback or for local testing, one might call the function with a hardcoded value:
    // console.log("Executing with a default iteration count of 10 for demonstration.");
    // sequenceGeneratorMain("10"); // Example fallback
}