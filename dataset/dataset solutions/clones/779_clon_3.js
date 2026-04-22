// This script emulates an old-school mobile phone keypad decoding system.
// It takes sequences of numeric presses and translates them into text messages.

// Import the Node.js file system module to handle input operations.
const fs = require('fs');

// --- Input Acquisition ---
// Read the entire content from standard input (typically '/dev/stdin' on Unix-like systems).
// The input is expected to be a UTF-8 encoded string.
const rawInputBuffer = fs.readFileSync('/dev/stdin', 'utf8');

// --- Pre-processing Input Data ---
// Normalize the input: remove any leading or trailing whitespace, then split it
// into an array of strings, where each string represents a separate line from the input.
let messageEntryLines = rawInputBuffer.trim().split('\n');

// The very first line of the input is designated as the total count
// of subsequent message sequences to be processed.
// We extract this line, convert it to an integer, and store it.
// The `shift()` method removes the first element from the array and returns it.
const numberOfMessagesToProcess = parseInt(messageEntryLines.shift(), 10);

// --- Keypad Character Mapping Configuration ---
// This constant array defines the characters associated with each numeric keypad button.
// The index of the outer array corresponds to the keypad digit (1-9).
// Index 0 is left empty or as an empty array since '0' is used as a separator, not a character key.
const telephoneKeypadCharacterMappings = [
    // Index 0: Delimiter key, no characters directly mapped.
    [],
    // Key 1: Special punctuation and space.
    ['.', ',', '!', '?', ' '],
    // Key 2: 'a', 'b', 'c'
    ['a', 'b', 'c'],
    // Key 3: 'd', 'e', 'f'
    ['d', 'e', 'f'],
    // Key 4: 'g', 'h', 'i'
    ['g', 'h', 'i'],
    // Key 5: 'j', 'k', 'l'
    ['j', 'k', 'l'],
    // Key 6: 'm', 'n', 'o'
    ['m', 'n', 'o'],
    // Key 7: 'p', 'q', 'r', 's'
    ['p', 'q', 'r', 's'],
    // Key 8: 't', 'u', 'v'
    ['t', 'u', 'v'],
    // Key 9: 'w', 'x', 'y', 'z'
    ['w', 'x', 'y', 'z']
];

/**
 * Transforms a raw string of numeric keypad presses into a human-readable text message.
 * Consecutive presses of the same digit cycle through its associated characters.
 * A '0' press signifies the completion of the current character selection.
 *
 * @param {string} inputPressSequence - A string like "22333044" representing keypad presses.
 * @returns {string} The decoded text message.
 */
function interpretKeypadInput(inputPressSequence) {
    // Convert the input string of digits into an array of numeric values.
    // Each character is parsed as a base-10 integer.
    const numericPresses = inputPressSequence.split('').map(Number);

    // This string will accumulate the final decoded message.
    let finalDecodedMessage = '';

    // State object to keep track of the current character being selected
    // and how many times its corresponding key has been pressed consecutively.
    let currentCharacterSelectionState = {
        selectedChar: '',   // The character currently chosen from a key's options.
        pressCount: -1      // Counter for consecutive key presses; -1 means no key is active.
    };

    // Iterate over each numeric press in the sequence.
    for (const digitPressed of numericPresses) {
        // Check if the pressed digit is a valid character key (1 through 9).
        if (digitPressed >= 1 && digitPressed <= 9) {
            // Increment the counter for consecutive presses of the current key.
            currentCharacterSelectionState.pressCount++;

            // Retrieve the array of possible characters for the current keypad digit.
            const characterOptions = telephoneKeypadCharacterMappings[digitPressed];

            // Basic validation: ensure the keypad digit actually has character mappings.
            // This guards against potential issues with malformed `telephoneKeypadCharacterMappings`.
            if (!characterOptions || characterOptions.length === 0) {
                console.warn(`Warning: Keypad digit ${digitPressed} has no defined characters.`);
                // Reset state to avoid carrying over invalid selections.
                currentCharacterSelectionState.selectedChar = '';
                currentCharacterSelectionState.pressCount = -1;
                continue; // Skip to the next digit.
            }

            // Determine the index of the character to select by using the modulo operator.
            // This cycles through the characters available for the pressed key.
            const characterOptionIndex = currentCharacterSelectionState.pressCount % characterOptions.length;

            // Update the currently selected character based on the calculated index.
            currentCharacterSelectionState.selectedChar = characterOptions[characterOptionIndex];
        } else if (digitPressed === 0) {
            // A '0' indicates that the user has finished selecting the current character.
            // If a character was actively selected, append it to the final message.
            if (currentCharacterSelectionState.selectedChar !== '') {
                finalDecodedMessage += currentCharacterSelectionState.selectedChar;
            }

            // Reset the selection state, preparing for the next character sequence.
            currentCharacterSelectionState.selectedChar = '';
            currentCharacterSelectionState.pressCount = -1;
        } else {
            // Guard clause for unexpected or invalid numeric input (e.g., NaN, negative numbers).
            console.error(`Error: Encountered an unexpected non-keypad input value: ${digitPressed}. Resetting state.`);
            // Reset state to prevent propagation of errors.
            currentCharacterSelectionState.selectedChar = '';
            currentCharacterSelectionState.pressCount = -1;
        }
    }

    // --- Post-loop Character Handling (Type III Addition) ---
    // After processing all digits, if there's a character still held in the
    // `currentCharacterSelectionState` (meaning the sequence ended with character presses
    // but without a final '0' to commit it), append it to the message.
    // The original code would have silently dropped this last character.
    if (currentCharacterSelectionState.selectedChar !== '') {
        finalDecodedMessage += currentCharacterSelectionState.selectedChar;
    }

    return finalDecodedMessage;
}

// --- Main Message Processing Loop ---

// Validate the parsed message count. If it's not a valid positive number,
// log an error and skip the processing loop to prevent unexpected behavior.
if (isNaN(numberOfMessagesToProcess) || numberOfMessagesToProcess <= 0) {
    console.error("Error: The total number of messages to process is invalid or missing.");
} else {
    // Iterate through each of the message sequences as indicated by `numberOfMessagesToProcess`.
    for (let currentMessageIndex = 0; currentMessageIndex < numberOfMessagesToProcess; ++currentMessageIndex) {
        const currentInputLine = messageEntryLines[currentMessageIndex];

        // Guard clause: Check if the current line actually exists in the array.
        // This handles cases where `numberOfMessagesToProcess` might be greater than actual lines.
        if (currentInputLine === undefined || currentInputLine === null) {
            console.warn(`Warning: Input line for message ${currentMessageIndex + 1} is missing. Skipping.`);
            continue; // Move to the next iteration.
        }

        // Decode the current line's keypad sequence into a text message.
        const resultMessage = interpretKeypadInput(currentInputLine);

        // Output the decoded message to the console.
        console.log(resultMessage);
    }
}