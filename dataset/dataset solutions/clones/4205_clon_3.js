const checkUniformity = (charSequence) => {
    // If the sequence is empty or contains only one character, it's considered uniform.
    // This serves as an initial guard clause for trivial cases.
    if (!charSequence || charSequence.length <= 1) {
        return true;
    }

    // Store the very first character for comparison against subsequent characters.
    const initialCharacter = charSequence[0];

    // Iterate through the rest of the sequence starting from the second character.
    // If any character differs from the initial one, the sequence is not uniform.
    for (let idx = 1; idx < charSequence.length; idx++) {
        if (charSequence[idx] !== initialCharacter) {
            return false; // Found a differing character, so it's not uniform.
        }
    }

    // If the loop completes without finding any differing characters, the sequence is uniform.
    return true;
};

// This function encapsulates the primary logic for analyzing the input string pattern.
function analyzeStringPattern(rawInputContent) {
    // Extract the first line from the provided raw input string.
    // This assumes the relevant data is always on the first line.
    const relevantLine = rawInputContent.split('\n')[0];

    // Convert the extracted string into an array of individual characters.
    // This allows for easier manipulation and slicing of parts of the string.
    const characterSequence = Array.from(relevantLine);

    // A boolean flag to store the result of our pattern check.
    // It will be true if the specific "NO" condition is met, false otherwise.
    let isSpecificPatternFound = false;

    // Determine the total length of the character sequence.
    const sequenceLength = characterSequence.length;

    // Check if the sequence length is an even number.
    const isLengthEven = (sequenceLength % 2 === 0);

    if (isLengthEven) {
        // For strings with an even number of characters, we focus on the first half.
        // The original logic effectively checks if the first 'length / 2' characters are all identical.
        const halfLength = sequenceLength / 2;
        const firstHalfSegment = characterSequence.slice(0, halfLength);

        // Apply our uniformity check to this first segment.
        isSpecificPatternFound = checkUniformity(firstHalfSegment);
    } else {
        // For strings with an odd number of characters, the middle character is disregarded.
        // We examine the segments before and after the middle character.
        const midPointIndex = Math.floor(sequenceLength / 2); // Calculate the index of the middle character.
        
        // Extract the segment of characters located before the middle character.
        const leftSubsegment = characterSequence.slice(0, midPointIndex);

        // Extract the segment of characters located after the middle character.
        const rightSubsegment = characterSequence.slice(midPointIndex + 1);

        // The specific pattern is found if both the left and right subsegments are uniform.
        isSpecificPatternFound = checkUniformity(leftSubsegment) && checkUniformity(rightSubsegment);
    }

    // Based on whether the specific pattern was found, output the corresponding message.
    if (isSpecificPatternFound) {
        console.log("NO"); // The pattern that leads to "NO" was identified.
    } else {
        console.log("YES"); // The pattern was not identified, so it defaults to "YES".
    }
}

// This function serves as the entry point for the script, handling file reading.
const initiateProcessingFromFile = (fileContent) => {
    // Call the main analysis function with the content read from the file.
    analyzeStringPattern(fileContent);
};

// Execute the process by reading the input from standard input (/dev/stdin)
// and then passing its content to our initial processing function.
initiateProcessingFromFile(require("fs").readFileSync("/dev/stdin", "utf8"));