let totalEntryCount;
let rawStringCollection = [];
let processedBalanceMetrics = []; // Stores [unmatched_closing, unmatched_opening] for each string

// Utility function to parse a numeric value from the input stream
function readNumericValue() {
    const value = Number.parseInt(inputBuffer[currentInputIndex++], 10);
    // Optional: Add validation for NaN or non-positive numbers if context allows
    if (Number.isNaN(value)) {
        throw new Error("Expected a numeric input but received a non-numeric value.");
    }
    return value;
}

// Utility function to read a string token from the input stream
function readStringValue() {
    return inputBuffer[currentInputIndex++];
}

// Helper function to output the final result
function outputResult(message) {
    console.log(message);
}

/**
 * Analyzes a given string sequence of parentheses to determine its balance factors.
 * It returns an array [unmatchedClosing, unmatchedOpening], where:
 * - unmatchedClosing: The count of closing parentheses that could not be matched by a preceding opening parenthesis.
 * - unmatchedOpening: The count of opening parentheses that remain unmatched at the end of the string.
 * @param {string} sequence - The input string consisting of '(' and ')' characters.
 * @returns {number[]} An array containing [unmatchedClosingCount, unmatchedOpeningCount].
 */
function analyzeSequenceBalance(sequence) {
    // This function replaces the original 'simplify' function.
    // It determines how many open brackets are needed to balance the prefix,
    // and how many open brackets are left over after matching.

    const sequenceLength = sequence.length;
    let requiredOpenParentheses = 0; // Corresponds to original p[0]
    let currentOpenParenthesesBalance = 0; // Corresponds to original p[1]

    for (let charIndex = 0; charIndex < sequenceLength; ++charIndex) {
        const currentChar = sequence[charIndex];
        if (currentChar === '(') {
            currentOpenParenthesesBalance = currentOpenParenthesesBalance + 1;
        } else { // It's a ')'
            if (currentOpenParenthesesBalance > 0) {
                currentOpenParenthesesBalance = currentOpenParenthesesBalance - 1;
            } else {
                // This ')' has no preceding '(' to match, so it's an unmatched closing parenthesis.
                requiredOpenParentheses = requiredOpenParentheses + 1;
            }
        }
    }
    // The result represents [required_to_balance_prefix, remaining_open_after_matching]
    return [requiredOpenParentheses, currentOpenParenthesesBalance];
}

// The main orchestration function, replacing the original 'main'
function orchestrateSolution() {
    totalEntryCount = readNumericValue();

    // Guard clause: Handle cases with no input strings
    if (totalEntryCount <= 0) {
        outputResult('No');
        return;
    }

    // Populate the raw string collection
    for (let i = 0; i < totalEntryCount; ++i) {
        rawStringCollection.push(readStringValue());
    }
    
    // Process each string to get its balance metrics
    for (let i = 0; i < totalEntryCount; ++i) {
        processedBalanceMetrics.push(analyzeSequenceBalance(rawStringCollection[i]));
    }

    let currentCumulativeBalance = 0; // Tracks the current balance of open parentheses
    let isSolutionFeasible = true; // Indicates if a valid sequence can be formed

    // Use a Set to keep track of indices of strings that have been consumed.
    // This replaces the original method of setting array elements to 'null'.
    const consumedSequenceIndices = new Set();

    // Iterate 'totalEntryCount' times, trying to consume one string in each iteration.
    // This ensures all strings are considered exactly once if a solution exists.
    for (let iterationStep = 0; iterationStep < totalEntryCount; ++iterationStep) {
        let consumableFoundInIteration = false;
        
        // Iterate through all balance metrics to find a suitable string to consume
        for (let i = 0; i < totalEntryCount; ++i) {
            // Only consider strings that have not been consumed yet
            if (!consumedSequenceIndices.has(i)) {
                const currentSequenceMetric = processedBalanceMetrics[i];
                const requiredPrefixOpen = currentSequenceMetric[0]; // How many open brackets are needed before this string
                const generatedSuffixOpen = currentSequenceMetric[1]; // How many open brackets this string adds after balancing itself

                // Check if the current cumulative balance is sufficient to cover the required prefix open brackets
                if (currentCumulativeBalance >= requiredPrefixOpen) {
                    // If yes, consume this string and update the cumulative balance
                    currentCumulativeBalance += (generatedSuffixOpen - requiredPrefixOpen);
                    consumedSequenceIndices.add(i); // Mark string as consumed
                    consumableFoundInIteration = true; // Flag that we found and processed a string
                    break; // Move to the next iteration step of the outer loop
                }
            }
        }

        // If no string could be consumed in this iteration, the solution is not feasible
        if (!consumableFoundInIteration) {
            isSolutionFeasible = false;
            break; // No need to continue, we've failed
        }
    }

    // The final result is 'Yes' if a feasible solution was found AND the final balance is zero.
    // Otherwise, it's 'No'.
    outputResult(isSolutionFeasible && currentCumulativeBalance === 0 ? 'Yes' : 'No');
}

// Standard input/output setup, slightly modified for Type III
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let inputBuffer = '';
let currentInputIndex = 0; // Tracks the current position in the tokenized input array
 
process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    try {
        // Process the entire input buffer: trim whitespace and split into tokens
        inputBuffer = inputBuffer.trim().split(/\s+/);
        
        // Execute the main solution logic
        orchestrateSolution();
    } catch (error) {
        // Catch and log any errors that occur during execution
        console.error("Execution encountered an error:", error.message);
        outputResult('Error during processing'); // Indicate a failure state
    }
});