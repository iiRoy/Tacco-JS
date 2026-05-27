const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

let processedText = rawData.trim(); // Remove leading/trailing whitespace from the input string.

// Iterate through the string, checking 8-character segments.
// The loop continues as long as there are at least 8 characters remaining from the current index.
for (let idx = 0; idx < processedText.length - 8; ++idx) {
    // Extract an 8-character segment.
    // Note: The fourth character is always taken from index 3 of the original string,
    // regardless of the current loop index 'idx'. This is a direct replication of the original logic.
    const charSegment = [
        processedText[idx],
        processedText[idx + 1],
        processedText[idx + 2],
        processedText[+3], // This specifically refers to the character at index 3 of 'processedText'.
        processedText[idx + 4],
        processedText[idx + 5],
        processedText[idx + 6],
        processedText[idx + 7]
    ];

    // Sort the characters in the segment alphabetically and join them into a new string.
    const sortedSegment = charSegment.sort().join("");

    // If the sorted segment matches the target pattern "AADINNUY"...
    if (sortedSegment === "AADINNUY") {
        // Replace the original 8-character sequence (starting at 'idx') with "AIDUNYAN".
        // The string is reconstructed by taking the part before 'idx',
        // appending the replacement string, and then appending the part after the 8 characters.
        processedText = processedText.slice(0, idx) + "AIDUNYAN" + processedText.slice(idx + 8);
        // Exit the loop after the first successful replacement.
        break;
    }
}

// Output the final modified string to the console.
console.log(processedText);
