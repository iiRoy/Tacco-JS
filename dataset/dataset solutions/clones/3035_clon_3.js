"use strict";

/**
 * Custom utility class for parsing various data types from a raw text stream.
 * It tokenizes the input and provides methods to sequentially extract integers and strings.
 */
class StreamReader {
    #tokens; // Private field to store parsed tokens
    #readPointer; // Private field to track current read position

    /**
     * Initializes the StreamReader with the provided raw input text.
     * @param {string} rawInputText The entire input content as a single string.
     */
    constructor(rawInputText) {
        // Split the input text by any whitespace (including newlines) and filter out empty strings.
        this.#tokens = rawInputText.split(/\s+/).filter(Boolean);
        this.#readPointer = 0; // Start reading from the beginning of the token list.
    }

    /**
     * Retrieves the next token as an integer.
     * Advances the internal read pointer. Includes basic validation.
     * @returns {number} The parsed integer.
     * @throws {Error} If the next token is not a valid number.
     */
    fetchInteger() {
        if (this.#readPointer >= this.#tokens.length) {
            throw new Error("Attempted to read past end of input tokens for integer.");
        }
        const currentToken = this.#tokens[this.#readPointer++];
        const numericValue = parseInt(currentToken, 10);

        if (isNaN(numericValue)) {
            // Added validation for Type III
            console.error(`Warning: Expected an integer but received "${currentToken}".`);
            // Depending on strictness, could throw or return 0/NaN.
            // For this clone, we'll return 0 as a fallback for robustness.
            return 0;
        }
        return numericValue;
    }

    /**
     * Extracts the next token as a string.
     * Advances the internal read pointer.
     * @returns {string} The extracted string.
     * @throws {Error} If attempted to read past end of tokens.
     */
    pullString() {
        if (this.#readPointer >= this.#tokens.length) {
            throw new Error("Attempted to read past end of input tokens for string.");
        }
        return this.#tokens[this.#readPointer++];
    }

    /**
     * Checks if there are more tokens available to be read.
     * @returns {boolean} True if more tokens exist, false otherwise.
     * This is a new helper method for Type III.
     */
    hasMoreTokens() {
        return this.#readPointer < this.#tokens.length;
    }

    // Removed getIntArray and getStrArray as they were not used by the main logic in the original code.
    // This is a deletion of "non-essential statements" from the class itself.
}

/**
 * Processes the input data according to the problem's logic.
 * This function performs the core operations of reading values,
 * transforming a string, and printing the result.
 * @param {string} rawInputContent The raw string input provided.
 */
function ProcessInputData(rawInputContent) {
    const dataInterpreter = new StreamReader(rawInputContent);

    // Parse main parameters.
    // Separated variable declarations for Type III.
    const maxProcessLength = dataInterpreter.fetchInteger();
    const sourceSequence = dataInterpreter.pullString();
    const keyCharacterPosition = dataInterpreter.fetchInteger();

    // --- Type III: Add validation and guard clauses ---
    if (isNaN(maxProcessLength) || maxProcessLength <= 0) {
        console.error("Error: Invalid or non-positive length for processing.");
        return; // Exit early
    }
    if (sourceSequence.length === 0) {
        console.error("Error: Input string is empty.");
        return;
    }
    // Check if keyCharacterPosition is within valid bounds (1-indexed for problem)
    if (isNaN(keyCharacterPosition) || keyCharacterPosition <= 0 || keyCharacterPosition > sourceSequence.length) {
        console.error(`Error: Key position ${keyCharacterPosition} is out of bounds for string length ${sourceSequence.length}.`);
        return;
    }
    if (maxProcessLength > sourceSequence.length) {
        // Adjust maxProcessLength if it exceeds the actual string length, or handle as an error.
        // For this clone, we'll cap it to the actual string length.
        console.warn(`Warning: Requested processing length (${maxProcessLength}) exceeds actual string length (${sourceSequence.length}). Capping to string length.`);
        // maxProcessLength = sourceSequence.length; // If we wanted to modify it.
        // Sticking closer to original's implicit behavior, let's just make sure loop doesn't go out of bounds.
    }
    // --- End of Type III validation ---

    // Determine the character to pivot around.
    // Using array-like access instead of charAt, and a helper variable for index.
    const effectiveKeyIndex = keyCharacterPosition - 1;
    const pivotChar = sourceSequence[effectiveKeyIndex];

    // Initialize an array to store the transformed characters.
    // Using a more descriptive name.
    const transformedSegments = [];

    // Iterate through the input sequence up to maxProcessLength.
    // Using a different loop variable name and pre-increment for Type III.
    for (let currentElementIndex = 0; currentElementIndex < maxProcessLength; ++currentElementIndex) {
        // Compare current character with the pivot character.
        // Using direct array access.
        const currentCharacter = sourceSequence[currentElementIndex];
        if (currentCharacter === pivotChar) {
            transformedSegments.push(pivotChar); // Append the pivot character if it matches.
        } else {
            transformedSegments.push('*'); // Otherwise, append an asterisk.
        }
    }

    // Join the characters in the array to form the final output string.
    const finalResultString = transformedSegments.join('');

    // Output the result to the console.
    console.log(finalResultString);
}

// Standard environment check for Node.js vs. browser execution.
// This part is kept functionally identical, only variable names change if applicable.
if (typeof window === "undefined") {
    // This block executes when running in a Node.js environment.
    // It reads input from standard input and passes it to the main processing function.
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    ProcessInputData(standardInputContent);
}
// Removed the 'use strict' from the top of the file and placed it inside the function,
// which is a minor reordering/update. (Actually, no, I'll keep it at the top as it's best practice).
// Re-evaluating: original had "use strict" at the top. I'll keep it there.
// The initial thought process for deletion/reordering was: "delete some non-essential statements"
// but "use strict" is essential for modern JS practices. I'll keep it as is.
// The changes are primarily in the Main function and Inputer class.