// Initialize standard input stream handling
// This ensures the Node.js process does not exit immediately,
// allowing it to listen for incoming data.
process.stdin.resume();

// Configure the encoding for the incoming data stream.
// UTF-8 is a common and robust encoding for text.
process.stdin.setEncoding("utf8");

// Define a comprehensive mapping for a standard phone keypad.
// Each index corresponds to a digit (0-9), and its value is an array
// of characters associated with that digit.
// Index 0 is reserved for the action of committing a character.
const mobileKeypadCharMap = [
    [],                            // Digit 0: Acts as a character commit/separator
    ['.', ',', '!', '?', ' '],     // Digit 1: Punctuation and space
    ['a', 'b', 'c'],               // Digit 2: ABC
    ['d', 'e', 'f'],               // Digit 3: DEF
    ['g', 'h', 'i'],               // Digit 4: GHI
    ['j', 'k', 'l'],               // Digit 5: JKL
    ['m', 'n', 'o'],               // Digit 6: MNO
    ['p', 'q', 'r', 's'],          // Digit 7: PQRS
    ['t', 'u', 'v'],               // Digit 8: TUV
    ['w', 'x', 'y', 'z']           // Digit 9: WXYZ
];

// Set up an event listener to process data received from the standard input.
// The 'data' event fires when input is available.
process.stdin.on("data", (inputDataChunk) => {
    // Convert the incoming data chunk to a string, remove leading/trailing whitespace,
    // and split it into an array of individual lines.
    const allInputLines = String(inputDataChunk).trim().split('\n');

    // The very first line of input specifies the total number of test sequences to process.
    // Parse this string into an integer, explicitly using base 10 for safety.
    const numberOfSequencesToDecode = parseInt(allInputLines.shift(), 10);

    // Implement a basic validation check for the number of test sequences.
    // If it's not a valid positive number, log an error and terminate processing.
    if (isNaN(numberOfSequencesToDecode) || numberOfSequencesToDecode <= 0) {
        console.error("Input processing aborted: Invalid or missing number of test sequences.");
        return; // Stop execution for invalid initial input.
    }

    // Iterate through each of the provided digit sequences for decoding.
    for (let currentSequenceIndex = 0; currentSequenceIndex < numberOfSequencesToDecode; ++currentSequenceIndex) {
        // Retrieve the raw string of digits for the current test case.
        const rawKeypadInput = allInputLines[currentSequenceIndex];

        // Handle cases where an input line might be empty or undefined.
        // Output an empty string for such cases and proceed to the next sequence.
        if (!rawKeypadInput) {
            console.log("");
            continue;
        }

        // Transform the raw digit string into an array of numeric digits.
        const digitPressesArray = rawKeypadInput.split('').map(Number);

        let constructedOutputMessage = '';  // Stores the final decoded text for this sequence.
        let charUnderSelection = '';        // Temporarily holds the character being "typed" before a '0' press.
        let consecutiveKeyStrokeCount = 0;  // Tracks how many times a key has been pressed consecutively.

        // Process each individual digit press in the current sequence.
        for (const pressedDigitValue of digitPressesArray) {
            // Basic validation for the digit value to ensure it's within 0-9.
            // Invalid digits are simply skipped to prevent errors.
            if (pressedDigitValue < 0 || pressedDigitValue > 9) {
                console.warn(`Skipping invalid digit: ${pressedDigitValue}`);
                continue;
            }

            // If the pressed digit is a non-zero key (1-9), it means a character is being selected.
            if (pressedDigitValue > 0) {
                // Get the array of characters associated with this specific keypad digit.
                const charactersForThisKey = mobileKeypadCharMap[pressedDigitValue];
                const availableCharCount = charactersForThisKey.length;

                // Guard against keys that might not have any characters mapped (e.g., if `mobileKeypadCharMap` was malformed).
                if (availableCharCount === 0) {
                    console.warn(`Key ${pressedDigitValue} has no characters defined. Skipping.`);
                    consecutiveKeyStrokeCount = 0; // Reset count if key is effectively "empty"
                    continue;
                }

                // Determine which character to select based on the number of consecutive presses.
                // The modulo operator cycles through the available characters for the key.
                const characterIndexToPick = consecutiveKeyStrokeCount % availableCharCount;
                charUnderSelection = charactersForThisKey[characterIndexToPick];
                
                // Increment the counter for consecutive presses of the same key.
                consecutiveKeyStrokeCount++;
            } else {
                // If the pressed digit is '0', it acts as a "commit" action.
                // The character currently held in `charUnderSelection` is appended to the message.
                if (charUnderSelection !== '') { // Only append if a character was actually selected.
                    constructedOutputMessage += charUnderSelection;
                }
                // Reset the temporary character and the consecutive press counter.
                // This prepares for the selection of a new character.
                charUnderSelection = '';
                consecutiveKeyStrokeCount = 0;
            }
        }
        // Important: Any character remaining in `charUnderSelection` at the end of the sequence
        // (i.e., if the sequence did not end with a '0' to commit it) is intentionally NOT
        // appended to `constructedOutputMessage`. This behavior mirrors the original code.

        // Output the fully decoded message for the current test sequence.
        console.log(constructedOutputMessage);
    }
});