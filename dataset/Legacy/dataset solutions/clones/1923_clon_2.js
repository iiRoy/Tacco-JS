// This module provides utilities for parsing input strings.
function InputParser(initialString) {
    // Reference to the current instance for internal use.
    const instance = this;

    // Tracks the position of the next token to be retrieved.
    instance.currentPosition = 0;

    // Stores the original input string.
    instance.originalInputString = initialString;

    // Processes the input string into an array of tokens.
    instance.tokenizedStrings = (function(inputData) {
        const processedTokens = [];
        // Replace multiple whitespace characters (newline, space, tab) with a single space.
        const cleanedInput = inputData.replace(/[\n \t]+/g, " ");
        // Split the cleaned string by spaces to get individual tokens.
        const rawTokens = cleanedInput.split(" ");
        // Populate the result array, ensuring each token is added.
        for (let idx = 0; idx < rawTokens.length; idx++) {
            processedTokens.push(rawTokens[idx]);
        }
        return processedTokens;
    }(initialString)); // Immediately invoked with the initial string.

    /**
     * Retrieves the next string token from the parsed input.
     * @returns {string|null} The next token as a string, or null if no more tokens.
     */
    instance.getNextToken = function() {
        const retrievedToken = instance.tokenizedStrings[instance.currentPosition];
        instance.currentPosition++; // Advance the position for the next call.
        return (retrievedToken !== undefined) ? retrievedToken : null;
    };

    /**
     * Retrieves the next token and attempts to parse it as an integer.
     * @returns {number|null} The next token as an integer, or null if no more tokens.
     */
    instance.getNextInteger = function() {
        const retrievedToken = instance.tokenizedStrings[instance.currentPosition];
        instance.currentPosition++;
        return (retrievedToken !== undefined) ? parseInt(retrievedToken, 10) : null;
    };

    /**
     * Retrieves the next token and attempts to parse it as a floating-point number.
     * @returns {number|null} The next token as a float, or null if no more tokens.
     */
    instance.getNextFloat = function() {
        const retrievedToken = instance.tokenizedStrings[instance.currentPosition];
        instance.currentPosition++;
        return (retrievedToken !== undefined) ? parseFloat(retrievedToken) : null;
    };

    /**
     * Retrieves the next token and attempts to convert it into an Int8Array.
     * Note: This conversion might not be directly equivalent to Java's byte type without specific handling.
     * @returns {Int8Array|null} An Int8Array representation of the token, or null.
     */
    instance.getNextByteArray = function() {
        const retrievedToken = instance.tokenizedStrings[instance.currentPosition];
        instance.currentPosition++;
        // This is a direct translation of the original, which might be problematic for non-numeric strings.
        // The original code creates Int8Array from a string, which results in an empty array or an array of 0s.
        // For strict Type II, we keep the original behavior.
        return (retrievedToken !== undefined) ? new Int8Array(retrievedToken) : null;
    };
}

// Main processing function for the problem.
function ProcessData(dataReader) {
    // Read problem parameters.
    const numElements = dataReader.getNextInteger();
    const maxValue = dataReader.getNextInteger();
    const numQueries = dataReader.getNextInteger();

    // Array to store query details.
    const queryDetails = [];
    // Variable to hold the maximum score found.
    let maxScore = 0;
    // Variable to hold the score for the current combination.
    let currentScore = 0;

    // Populate the query details array.
    for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        const queryItem = {
            startIdx: dataReader.getNextInteger(), // 'a' in original
            endIdx: dataReader.getNextInteger(),   // 'b' in original
            targetDiff: dataReader.getNextInteger(), // 'c' in original
            scoreValue: dataReader.getNextInteger(), // 'd' in original
        };
        queryDetails.push(queryItem);
    }

    // Initialize the sequence array with '1's.
    const sequence = [];
    for (let initIndex = 0; initIndex < numElements; initIndex++) {
        sequence.push(1);
    }

    // Iterate through all possible combinations of numbers.
    // This loop effectively counts from 0 to M^N - 1 in a base-M system,
    // where each digit corresponds to an element in 'sequence'.
    for (let iterationCount = 0; iterationCount < Math.pow(maxValue, numElements); iterationCount++) {

        // Increment the first element and handle carries.
        sequence[0]++;
        for (let carryIndex = 0; carryIndex < numElements; carryIndex++) {
            if (sequence[carryIndex] > maxValue) {
                sequence[carryIndex] = 1; // Reset to 1 if it exceeds maxValue.
                // Carry over to the next element. This can potentially extend the array
                // if carryIndex is numElements - 1, matching original behavior.
                sequence[carryIndex + 1]++;
            }
        }

        // Check if the current sequence is in ascending order.
        let isAscendingOrder = true;
        for (let checkIndex = 0; checkIndex < numElements - 1; checkIndex++) {
            if (sequence[checkIndex] > sequence[checkIndex + 1]) {
                isAscendingOrder = false;
                break; // No need to check further if order is broken.
            }
        }
        // If the sequence is not ascending, skip to the next combination.
        if (!isAscendingOrder) {
            continue;
        }

        // Calculate the score for the current valid sequence.
        currentScore = 0;
        for (let detailIndex = 0; detailIndex < queryDetails.length; detailIndex++) {
            const currentQuery = queryDetails[detailIndex];
            // Check the condition: sequence[b-1] - sequence[a-1] == c
            // Note: 'a' and 'b' are 1-indexed in the problem description, so we subtract 1 for 0-indexed array access.
            if (currentQuery.targetDiff === (sequence[currentQuery.endIdx - 1] - sequence[currentQuery.startIdx - 1])) {
                currentScore += currentQuery.scoreValue;
            }
        }
        // Update the maximum score if the current score is higher.
        if (maxScore < currentScore) {
            maxScore = currentScore;
        }
    }

    // Output the final maximum score.
    console.log(maxScore);
}

// Execute the main processing function.
// It reads input from standard input using Node.js 'fs' module.
ProcessData(new InputParser(require("fs").readFileSync("/dev/stdin", "utf8")));
