// This primary routine handles the overall data processing workflow.
function processData(rawDataInput) {
    // First, we prepare the incoming string data.
    // It's cleaned, segmented by newlines, and then each segment is converted into an integer.
    const numericEntries = rawDataInput
        .trim() // Remove leading/trailing whitespace from the whole input string.
        .split('\n') // Break the string into an array of substrings based on newline characters.
        .map(
            (lineSegment) =>
                parseInt(lineSegment, 10) // Transform each substring into a base-10 integer.
        );

    // Now, a crucial decision point is reached based on specific numerical comparisons.
    // We check if the difference between the fifth and first parsed values
    // is less than or equal to the sixth parsed value.
    if (numericEntries[4] - numericEntries[0] <= numericEntries[5])
    {
        // If the condition holds true, a positive affirmation is logged to the console.
        console.log('Yay!');
    }
    else
    {
        // Otherwise, if the condition is false, a negative indicator is output.
        console.log(':(');
    }
}

// The program initiates by calling the main processing function.
// It acquires its initial string data from standard input, encoded in UTF-8.
processData(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);