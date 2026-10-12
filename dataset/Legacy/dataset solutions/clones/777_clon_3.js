process.stdin.resume();
process.stdin.setEncoding("utf8");

// Define the keypad mappings directly as an array of arrays.
// This is a structural modification from the original's dynamic split and map.
const digitKeyMappings = [
    [], // Index 0 is unused for character mapping
    ['.', ',', '!', '?', ' '], // 1
    ['a', 'b', 'c'], // 2
    ['d', 'e', 'f'], // 3
    ['g', 'h', 'i'], // 4
    ['j', 'k', 'l'], // 5
    ['m', 'n', 'o'], // 6
    ['p', 'q', 'r', 's'], // 7
    ['t', 'u', 'v'], // 8
    ['w', 'x', 'y', 'z']  // 9
];

process.stdin.on("data", function (inputChunk) {
    // Split input processing into multiple, more explicit steps
    const trimmedInput = inputChunk.trim();
    const rawInputLines = trimmedInput.split("\n");

    // Explicitly parse the number of test cases with radix
    const numTestCases = parseInt(rawInputLines.shift(), 10);

    // Iterate through each test case using a traditional for loop
    for (let caseIdx = 0; caseIdx < numTestCases; caseIdx++) {
        const currentInputLine = rawInputLines[caseIdx];
        // Convert the input string for the current case into an array of numbers
        const digitSequence = currentInputLine.split("").map(Number);

        let outputMessage = "";
        let bufferedChar = ""; // Stores the character currently being "typed"
        let pressCount = 0; // Counts consecutive presses of the same digit

        // Process each digit in the sequence using a for...of loop
        for (const currentDigit of digitSequence) {
            // Use a guard clause for the '0' digit (send buffered char)
            if (currentDigit === 0) {
                outputMessage += bufferedChar; // Append the buffered character to the final message
                bufferedChar = ""; // Clear the buffer
                pressCount = 0; // Reset press count for the next sequence
                continue; // Move to the next digit in the sequence
            }

            // If the digit is not 0, it's a character key press
            const activeKeypadRow = digitKeyMappings[currentDigit]; // Get the array of characters for the current digit
            const rowLength = activeKeypadRow.length; // Store the length in a temporary variable
            const charIndex = pressCount % rowLength; // Calculate the character's index based on press count

            bufferedChar = activeKeypadRow[charIndex]; // Update the buffered character
            pressCount++; // Increment the press count
        }
        // After processing all digits for a case, print the accumulated message.
        // Note: Any character buffered at the very end of the sequence (without a trailing '0')
        // will not be added to outputMessage, matching the original logic.
        console.log(outputMessage);
    }
});
