function InputReader(sourceText) {
    const instanceReference = this;
    let currentTokenIndex = 0;

    // Helper function to prepare and split the input string into a list of tokens.
    // This replicates the original behavior:
    // 1. Replaces one or more occurrences of newline, space, or tab with a single space.
    //    Example: "a  b\t c\n d" becomes "a b c d"
    // 2. Then splits by a single space.
    // This can result in empty strings in the token list if the processed string starts/ends with spaces,
    // or has multiple consecutive spaces (e.g., "  1 2  " -> " 1 2 " -> ["", "1", "2", ""]).
    const tokenizeInput = (textPayload) => {
        const processedString = textPayload.replace(/[\n \t]+/g, " ");
        return processedString.split(" ");
    };

    const tokenList = tokenizeInput(sourceText);

    // Determines if there are more tokens available to be read.
    instanceReference.hasMoreTokens = function() {
        return currentTokenIndex < tokenList.length;
    };

    // Retrieves the next raw string token from the input.
    instanceReference.retrieveNextToken = function() {
        // If no more tokens, return null.
        if (!instanceReference.hasMoreTokens()) {
            return null;
        }
        // Fetch the token and advance the index.
        const fetchedToken = tokenList[currentTokenIndex];
        currentTokenIndex++;
        return fetchedToken;
    };

    // Retrieves the next token and attempts to parse it as an integer.
    // Returns NaN if the token is an empty string or not a valid integer, replicating original behavior.
    instanceReference.fetchNextInteger = function() {
        const tokenValue = instanceReference.retrieveNextToken();
        // Original logic: (result != null) ? parseInt(result) : null;
        // If tokenValue is "", parseInt("") is NaN. NaN != null is true. So returns NaN.
        return (tokenValue !== null) ? parseInt(tokenValue) : null;
    };

    // Retrieves the next token and attempts to parse it as a floating-point number.
    // Returns NaN if the token is an empty string or not a valid float, replicating original behavior.
    instanceReference.fetchNextDecimal = function() {
        const tokenValue = instanceReference.retrieveNextToken();
        return (tokenValue !== null) ? parseFloat(tokenValue) : null;
    };

    // Retrieves the next token and attempts to convert it into an Int8Array.
    // Replicates original behavior: `new Int8Array(string)` creates an array of ASCII codes.
    // For an empty string token, `new Int8Array("")` results in `Int8Array(0) []`.
    instanceReference.fetchNextByteRepresentation = function() {
        const tokenValue = instanceReference.retrieveNextToken();
        return (tokenValue !== null) ? new Int8Array(tokenValue) : null;
    };
}

function SolverApp(inputProcessor) {
    // Read initial configuration parameters from the input stream.
    const countN = inputProcessor.fetchNextInteger(); // Represents N: Number of elements in the sequence.
    const maxValM = inputProcessor.fetchNextInteger(); // Represents M: Maximum value for each element.
    const queryCountQ = inputProcessor.fetchNextInteger(); // Represents Q: Number of queries.

    // Basic validation for essential input parameters to prevent errors.
    if (countN === null || maxValM === null || queryCountQ === null || countN < 1 || maxValM < 1 || queryCountQ < 0) {
        // If any essential parameter is invalid or missing, log an error and terminate.
        console.error("Error: Invalid or missing initial input parameters (N, M, Q).");
        return;
    }

    // Array to store the details of each query object.
    const queryDetails = [];

    // Variable to track the highest score achieved across all valid sequences.
    let maximumAchievedScore = 0;

    // Loop through and parse all query details from the input.
    for (let qIdx = 0; qIdx < queryCountQ; qIdx++) {
        const currentQuery = {
            startIdxA: inputProcessor.fetchNextInteger(), // 'a' parameter (1-based index)
            endIdxB: inputProcessor.fetchNextInteger(),   // 'b' parameter (1-based index)
            diffValC: inputProcessor.fetchNextInteger(),  // 'c' parameter (required difference)
            scoreValD: inputProcessor.fetchNextInteger(), // 'd' parameter (score if condition met)
        };

        // Validate each query's parameters.
        if (Object.values(currentQuery).some(val => val === null || isNaN(val))) {
            console.error(`Error: Invalid or missing query parameters at index ${qIdx}. Skipping further processing.`);
            return;
        }
        queryDetails.push(currentQuery);
    }

    // Initialize an array representing a sequence, filled with the minimum allowed value (1).
    // This array will be mutated iteratively to generate all combinations.
    const generatedSequence = new Array(countN).fill(1);

    // Calculate the total number of combinations (M^N) to iterate through.
    // This acts as the upper bound for the combination generation loop.
    const maxPossibleCombinations = Math.pow(maxValM, countN);

    // Helper function to check if a sequence is strictly non-decreasing (ascending or equal).
    const isSequenceNonDecreasing = (seq) => {
        for (let idx = 0; idx < seq.length - 1; idx++) {
            if (seq[idx] > seq[idx + 1]) {
                return false; // Found a decreasing pair.
            }
        }
        return true; // Sequence is non-decreasing.
    };

    // Helper function to increment the sequence like a base-M number counter.
    // Digits range from 1 to `limit`. Carries propagate from left to right (lowest index to highest).
    const incrementSequence = (seq, limit) => {
        let carryFlag = 1; // Start with a carry to increment the first digit.
        for (let idx = 0; idx < seq.length && carryFlag > 0; idx++) {
            seq[idx] += carryFlag;
            carryFlag = 0; // Reset carry after adding.
            if (seq[idx] > limit) {
                seq[idx] = 1; // Reset to 1 on overflow.
                carryFlag = 1; // Propagate carry to the next digit.
            }
        }
        // If carryFlag is still 1 after the loop, it means the sequence has "rolled over"
        // (e.g., [M,M,...M] became [1,1,...1] with a carry beyond the last element).
        // This is the natural termination condition for the main loop.
    };

    // Main loop to generate and evaluate all possible sequences.
    // The loop runs `M^N` times, processing `M^N` distinct states of `generatedSequence`.
    // The `generatedSequence` is modified *before* evaluation in each iteration,
    // which means the initial `[1,1,...1]` state (before any increments) is not evaluated.
    // This behavior exactly mirrors the original code's combination generation.
    for (let combinationIterator = 0; combinationIterator < maxPossibleCombinations; combinationIterator++) {
        // Increment the sequence to get the next combination to evaluate.
        incrementSequence(generatedSequence, maxValM);

        // If the current sequence is not non-decreasing, skip its evaluation.
        if (!isSequenceNonDecreasing(generatedSequence)) {
            continue; // Move to the next combination.
        }

        // If the sequence is valid (non-decreasing), calculate its score.
        let currentSequenceScore = 0;
        const totalQueries = queryDetails.length;

        for (let queryIdx = 0; queryIdx < totalQueries; queryIdx++) {
            const currentQuery = queryDetails[queryIdx];
            // Adjust for 0-based array indexing from 1-based query parameters.
            const valueAtEndIdx = generatedSequence[currentQuery.endIdxB - 1];
            const valueAtStartIdx = generatedSequence[currentQuery.startIdxA - 1];

            // Check if the difference between elements at specified indices matches the query's 'c' value.
            if (valueAtEndIdx - valueAtStartIdx === currentQuery.diffValC) {
                currentSequenceScore += currentQuery.scoreValD; // Add the query's score.
            }
        }

        // Update the maximum achieved score if the current sequence's score is higher.
        maximumAchievedScore = Math.max(maximumAchievedScore, currentSequenceScore);
    }

    // Output the final maximum score found.
    console.log(maximumAchievedScore);
}

// Entry point for the application.
// Reads input from standard input, creates an InputReader, and passes it to the SolverApp.
SolverApp(new InputReader(require("fs").readFileSync("/dev/stdin", "utf8")));

// Example usage comments (replicated from original):
// SolverApp(new InputReader("33")); // Example with hardcoded input string

// var strValue = inputProcessor.retrieveNextToken();     // Get value as String
// var intValue = inputProcessor.fetchNextInteger();      // Get value as int
// var decValue = inputProcessor.fetchNextDecimal();      // Get value as BigDecimal (float)
// var byteArr = inputProcessor.fetchNextByteRepresentation(); // Get value as byte array