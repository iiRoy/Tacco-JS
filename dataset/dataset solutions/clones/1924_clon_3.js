function InputReader(rawData) {
    // Reference to the current instance of the reader.
    const instanceRef = this;
    // Tracks the current position in the tokenized data.
    instanceRef.currentIndex = 0;
    // Stores the original raw input string for potential debugging or future use.
    instanceRef.originalData = rawData;

    // --- Data Preprocessing and Tokenization ---
    // This section transforms the raw input string into an array of usable tokens.
    // It handles various whitespace characters and ensures robust splitting.
    if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
        // If input is invalid, null, or empty, initialize with an empty token list.
        instanceRef.tokenList = [];
        console.warn("InputReader initialized with invalid, empty, or whitespace-only data.");
    } else {
        // 1. Replace all sequences of whitespace (spaces, tabs, newlines) with a single space.
        // 2. Trim any leading or trailing whitespace from the result.
        const cleanedString = rawData.replace(/[\s]+/g, " ").trim();
        // 3. Split the cleaned string by spaces to get individual tokens.
        // 4. Filter out any empty strings that might result from splitting (e.g., if there were multiple spaces).
        instanceRef.tokenList = cleanedString.split(" ").filter(token => token !== '');
    }
    // --- End of Tokenization ---

    // A private helper function to retrieve the next available token and advance the internal pointer.
    const retrieveNextToken = () => {
        if (instanceRef.currentIndex >= instanceRef.tokenList.length) {
            // If no more tokens are available, return undefined.
            return undefined;
        }
        const tokenValue = instanceRef.tokenList[instanceRef.currentIndex];
        instanceRef.currentIndex++; // Move to the next token for subsequent calls.
        return tokenValue;
    };

    // Public method to read the next token as a string.
    instanceRef.readString = function() {
        // Returns the token or null if no token is available.
        return retrieveNextToken() || null;
    };

    // Public method to read the next token as an integer.
    instanceRef.readInteger = function() {
        const token = retrieveNextToken();
        // If a token exists, parse it as an integer with radix 10. Otherwise, return null.
        return token !== undefined ? parseInt(token, 10) : null;
    };

    // Public method to read the next token as a floating-point number (decimal).
    instanceRef.readDecimal = function() {
        const token = retrieveNextToken();
        // If a token exists, parse it as a float. Otherwise, return null.
        return token !== undefined ? parseFloat(token) : null;
    };

    // Public method to read the next token as a byte value (integer between 0 and 255).
    instanceRef.readByteValue = function() {
        const token = retrieveNextToken();
        if (token === undefined) {
            return null; // No token available.
        }
        const parsedByte = parseInt(token, 10);
        // Validate if the parsed value is a number and falls within the byte range (0-255).
        if (!isNaN(parsedByte) && parsedByte >= 0 && parsedByte <= 255) {
            return parsedByte;
        }
        // Log a warning for invalid byte values.
        console.warn(`InputReader: Encountered non-byte value '${token}'. Returning null.`);
        return null; // Return null if not a valid byte value.
    };
}


function SolveProblem(dataStream) {

    // Read initial problem parameters from the input stream.
    const arrayLength = dataStream.readInteger(); // Corresponds to 'N' in original
    const maxValue = dataStream.readInteger();   // Corresponds to 'M' in original
    const queryCount = dataStream.readInteger(); // Corresponds to 'Q' in original

    // --- Input Validation (Type III addition) ---
    // Ensure core parameters are valid before proceeding.
    if (arrayLength === null || maxValue === null || queryCount === null ||
        arrayLength <= 0 || maxValue <= 0 || queryCount < 0) {
        console.error("SolveProblem: Invalid or missing initial parameters. Cannot proceed.");
        return; // Exit if critical input is bad.
    }

    // Initialize data structures for conditions and scores.
    const conditionsList = []; // Stores all 'abcd' objects, renamed for clarity
    let maxAchievedScore = 0;  // Tracks the highest score found across all combinations
    let currentIterationScore = 0; // Score for the current combination being evaluated

    // Populate the list of conditions from the input stream.
    for (let k = 0; k < queryCount; k++) {
        const conditionItem = {
            idxA: dataStream.readInteger(),
            idxB: dataStream.readInteger(),
            valC: dataStream.readInteger(),
            scoreD: dataStream.readInteger(),
        };

        // --- Condition Item Validation (Type III addition) ---
        // Check if any part of the condition item is null (failed parsing).
        if (Object.values(conditionItem).some(val => val === null)) {
            console.warn(`SolveProblem: Skipping invalid condition item at index ${k} due to null values.`);
            continue; // Skip this condition and proceed to the next.
        }
        // Further validate indices against arrayLength (Type III addition).
        if (conditionItem.idxA <= 0 || conditionItem.idxA > arrayLength ||
            conditionItem.idxB <= 0 || conditionItem.idxB > arrayLength) {
            console.warn(`SolveProblem: Condition indices A(${conditionItem.idxA}) or B(${conditionItem.idxB}) out of bounds for arrayLength ${arrayLength}. Skipping.`);
            continue;
        }
        conditionsList.push(conditionItem);
    }

    // --- Sequence Generation Initialization ---
    // Create an array of 'arrayLength' elements, initialized with 1s.
    // This array will hold the current non-decreasing sequence of numbers.
    const currentSequence = new Array(arrayLength).fill(1);

    let terminationFlag = false; // Flag to signal when all combinations have been generated.
    let combinationEvaluatedCount = 0; // Counter for generated combinations (Type III addition).

    // --- Main Loop: Generate and Evaluate Combinations ---
    // This loop iterates through all possible non-decreasing sequences of 'arrayLength' numbers,
    // where each number is between 1 and 'maxValue'.
    while (!terminationFlag) {

        // Increment the last element of the sequence.
        currentSequence[arrayLength - 1]++;

        // Propagate increments/resets from right to left to maintain the non-decreasing property.
        for (let j = arrayLength - 1; j >= 0; j--) {
            // If the current element exceeds 'maxValue', a "carry-over" operation is needed.
            if (currentSequence[j] > maxValue) {
                if (j === 0) {
                    // If the first element exceeds 'maxValue', it means all combinations have been exhausted.
                    terminationFlag = true;
                    break; // Exit the inner propagation loop.
                }
                // Increment the previous element.
                currentSequence[j - 1]++;
                // Reset the current element and all subsequent elements to the value of the previous one.
                // This ensures the non-decreasing order is maintained.
                const resetValue = currentSequence[j - 1];
                for (let l = j; l < arrayLength; l++) {
                    currentSequence[l] = resetValue;
                }
            } else {
                // If the current element is within bounds, no further propagation is needed for this step.
                break; // Exit the inner propagation loop.
            }
        }

        // After updating the sequence, check if the termination flag was set.
        if (terminationFlag) {
            break; // Exit the main combination generation loop.
        }

        // --- Evaluate Current Sequence ---
        // Reset the score for the current combination.
        currentIterationScore = 0;
        // Iterate through each predefined condition to calculate the score for the current sequence.
        for (const condition of conditionsList) {
            // Use object destructuring for cleaner access to condition properties.
            const { idxA, idxB, valC, scoreD } = condition;

            // Check if the difference between the specified elements in the current sequence matches the condition's 'valC'.
            // Note: indices are 1-based in conditions, so subtract 1 for 0-based array access.
            if (currentSequence[idxB - 1] - currentSequence[idxA - 1] === valC) {
                currentIterationScore += scoreD; // Add the score if the condition is met.
            }
        }

        // Update the maximum achieved score if the current sequence's score is higher.
        maxAchievedScore = Math.max(maxAchievedScore, currentIterationScore);

        combinationEvaluatedCount++; // Increment the counter for combinations processed.

        // --- Safety Break (Type III addition) ---
        // This is a guard against extremely long-running computations, useful for debugging or
        // preventing timeouts in competitive programming if M and N are very large.
        if (combinationEvaluatedCount > 100_000_000) { // Arbitrary large limit
            console.warn("SolveProblem: Exceeded maximum allowed combinations. Terminating early.");
            break;
        }
    }

    // Output the final maximum score found.
    console.log(maxAchievedScore);
}

// --- Application Entry Point ---
// This block handles reading input from stdin and orchestrating the solution.
try {
    // Read the entire content of standard input as a UTF-8 string.
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Create an instance of the InputReader to parse the input.
    const inputProcessor = new InputReader(fileContent);
    // Call the main problem-solving function with the input processor.
    SolveProblem(inputProcessor);
} catch (error) {
    // Catch and log any errors that occur during file reading or problem execution.
    console.error("An unhandled error occurred during execution:", error.message);
    // Optionally, provide more detailed error information or a specific exit code.
    // process.exit(1);
}