// This function processes an incoming text block to replace specific placeholder characters.
function processTextualPattern(rawInputData) {
    // The initial input might contain multiple lines or leading/trailing whitespace.
    // We are interested only in the first line and the first word of that line.
    // Robustly convert input to string, remove leading/trailing whitespace, then split by newline.
    let relevantLine = String(rawInputData || '').trim().split('\n')[0];
    // Further isolate the very first word or segment from the extracted line.
    let targetSegment = relevantLine.split(' ')[0];

    // Early exit if the extracted segment is empty, preventing unnecessary processing.
    // This is an added guard clause for robustness.
    if (targetSegment.length === 0) {
        console.log('');
        return;
    }

    // Convert the target string into a mutable array of characters for easier manipulation.
    // Using 'let' for mutability during the transformation process.
    let characterSequence = Array.from(targetSegment);
    const sequenceLength = characterSequence.length; // Store length for performance and clarity.

    // Iterate through each character in the sequence to identify and replace placeholders.
    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        // Store the character at the current position for evaluation.
        let currentSymbol = characterSequence[currentIdx];

        // Only proceed with replacement logic if the current character is a '?' placeholder.
        if (currentSymbol === '?') {
            // Determine contextual information for the current character.
            const isFirstElement = (currentIdx === 0);
            const isLastElement = (currentIdx === sequenceLength - 1);

            // Retrieve the preceding character, if it exists, otherwise null.
            const precedingSymbol = isFirstElement ? null : characterSequence[currentIdx - 1];
            // Retrieve the succeeding character, if it exists, otherwise null.
            const succeedingSymbol = isLastElement ? null : characterSequence[currentIdx + 1];

            // Apply replacement rules based on context.
            if (isFirstElement) {
                // Special handling for the very first character in the sequence.
                if (isLastElement) {
                    // Case: The entire sequence is just a single '?' character.
                    // The original code assigned `arr = "D"`, which changed type.
                    // This update maintains the array type, `arr[0] = "D"`.
                    characterSequence[currentIdx] = 'D';
                } else if (succeedingSymbol === 'P') {
                    // If the next character is 'P', replace current '?' with 'D'.
                    characterSequence[currentIdx] = 'D';
                } else if (succeedingSymbol === 'D') {
                    // If the next character is 'D', replace current '?' with 'P'.
                    characterSequence[currentIdx] = 'P';
                } else if (succeedingSymbol === '?') {
                    // If the next character is also '?', default to 'P'.
                    // This implies a forward-looking decision when immediate context is ambiguous.
                    characterSequence[currentIdx] = 'P';
                }
            } else {
                // Handling for characters that are not the first in the sequence.
                // The decision here primarily relies on the character immediately before it.
                if (precedingSymbol === 'P') {
                    // If the previous character was 'P', replace current '?' with 'D'.
                    characterSequence[currentIdx] = 'D';
                } else if (precedingSymbol === 'D') {
                    // If the previous character was 'D', replace current '?' with 'P'.
                    characterSequence[currentIdx] = 'P';
                }
                // If the precedingSymbol is '?' (which would have been resolved by now due to left-to-right iteration)
                // or any other character not 'P' or 'D', the current '?' remains as is,
                // following the implicit rules of the original algorithm.
            }
        }
    }

    // Reconstruct the modified character sequence back into a single string.
    const finalProcessedOutput = characterSequence.join('');

    // Output the final result to the console.
    console.log(finalProcessedOutput);
}

// Standard boilerplate for reading input from stdin in a Node.js environment.
// This part reads the entire file content as a UTF-8 string.
const fileSystemModule = require("fs");
const systemInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the collected input.
processTextualPattern(systemInputData);