const fileSystemHandler = require('fs'); // Provides file system capabilities, typically for I/O operations.

/**
 * Calculates the proximity of each character in a string to the nearest preceding 'c'.
 * If 'c' has not yet been encountered, the proximity is -1.
 *
 * @param {string} textSegment The string segment to analyze.
 * @returns {number[]} An array where each element represents the distance to the last 'c'.
 */
function determineCharacterDistancesToC(textSegment) {
    const proximityValues = []; // Stores the calculated distance for each character.
    const individualCharacters = textSegment.split(''); // Breaks the input string into an array of characters.
    let distanceTracker = -1; // Initializes a counter for distance from 'c'. -1 signifies no 'c' found yet.

    // Iterate through the character array using a traditional for loop for precise index control.
    for (let charIndex = 0; charIndex < individualCharacters.length; ++charIndex) {
        const currentCharacter = individualCharacters[charIndex];

        // If the current character is 'c', reset the distance tracker to 0.
        if (currentCharacter === 'c') {
            distanceTracker = 0;
        }

        // Record the current state of the distance tracker.
        proximityValues.push(distanceTracker);

        // If a 'c' has been encountered (i.e., distanceTracker is not -1),
        // increment the tracker for the subsequent character's calculation.
        if (distanceTracker !== -1) {
            distanceTracker++;
        }
    }
    return proximityValues; // Return the array of computed distances.
}

// Acquire the entire raw content from the standard input stream.
// This operation is synchronous and assumes UTF-8 encoding.
const fullInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

// Prepare the input for processing:
// 1. Remove any leading or trailing whitespace from the entire content.
// 2. Divide the content into an array of strings, using the newline character as a delimiter.
// 3. Filter out any resultant empty strings, which can occur from multiple newlines or trailing newlines.
const processedInputLines = fullInputContent.trim().split('\n').filter(Boolean);

// Discard the very first line of the input. This is a common pattern in competitive programming
// where the first line often contains metadata like the number of test cases.
// Using `splice(0, 1)` removes the element and returns it in an array; we ignore the return value here.
processedInputLines.splice(0, 1);

// Process each remaining line individually.
for (const currentLineData of processedInputLines) {
    // Implement a basic validation step: skip lines that are empty or null.
    // This prevents errors in the `determineCharacterDistancesToC` function and handles malformed input gracefully.
    if (!currentLineData || currentLineData.length === 0) {
        // Optionally, one could log a message here indicating an empty line was skipped.
        continue; // Move to the next line without processing.
    }

    // Call the helper function to compute the character distances for the current line.
    const resultDistances = determineCharacterDistancesToC(currentLineData);

    // Output the calculated distances to standard output, with each number separated by a space.
    console.log(resultDistances.join(' '));
}