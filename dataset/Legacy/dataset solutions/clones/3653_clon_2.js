// This function serves as the primary entry point for processing the provided input data.
function processInput(rawData) {
    // Divide the entire input string into an array of individual lines, using newline characters as delimiters.
    const lineSegments = rawData.split('\n');

    // Transform the first line of input into an array of its constituent characters.
    let firstSequence = lineSegments[0].split('');
    // Transform the second line of input into an array of its constituent characters.
    let secondSequence = lineSegments[1].split('');

    // Initialize a numerical indicator to track whether a match is found; 0 signifies no match, 1 signifies a match.
    let matchFound = 0;

    // First, check if the two character sequences are identical in their initial state.
    if (firstSequence.toString() === secondSequence.toString()) {
        matchFound = 1; // If they are, set the indicator to show a match.
    } else {
        // If the sequences are not initially identical, proceed to attempt circular shifts on the first sequence.
        // Iterate through the first sequence, performing a circular shift in each step.
        // The loop runs (length - 1) times, as the last shift would bring it back to the original state.
        for (let idx = 0; idx < firstSequence.length - 1; idx++) {
            // Extract the character currently at the very end of the first sequence.
            const finalChar = firstSequence[firstSequence.length - 1];
            // Remove this last character from its current position.
            firstSequence.pop();
            // Insert the extracted character at the beginning of the sequence, completing a circular shift.
            firstSequence.unshift(finalChar);

            // After performing the shift, re-evaluate if the modified first sequence now matches the second.
            if (firstSequence.toString() === secondSequence.toString()) {
                matchFound = 1; // If a match is identified, update the indicator.
                break; // Since a match is found, there's no need for further shifts; exit the loop.
            }
        }
    }

    // Based on the final state of the match indicator, output the appropriate result to the console.
    if (matchFound === 1) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// Read the entire content of standard input synchronously, interpreting it as UTF-8 text,
// and then pass this raw data to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
