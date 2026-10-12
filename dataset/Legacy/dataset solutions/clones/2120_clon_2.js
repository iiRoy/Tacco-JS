// This function processes the incoming data to determine a specific outcome.
function ProcessInput(rawData) {
    // Initialize the final outcome variable to a default error state.
    let finalResult = -1;

    // Clean up the raw input by trimming whitespace and splitting it into individual lines.
    let processedLines = rawData.trim().split("\n");

    // Extract the first numerical value from the first line. This value dictates the size of an array.
    const arrayCapacity = parseInt(processedLines[0].split(' ').map((val) => (parseInt(val)))[0]);

    // Obtain the subsequent lines, which contain the actual data segments for processing.
    const dataSegments = processedLines.slice(1);

    // Create a new array with the determined capacity, pre-filling all its positions with a placeholder character.
    let outcomeArray = new Array(arrayCapacity).fill('a');

    // Iterate through each data segment to populate the outcome array based on the segment's content.
    for (let segmentIndex = 0; segmentIndex < dataSegments.length; ++segmentIndex) {
        // Parse the current segment into an array of integers.
        const currentSegment = dataSegments[segmentIndex].split(' ').map((val) => (parseInt(val)));
        // Use the first integer as an index (adjusting for zero-based indexing) and the second as the value to store.
        outcomeArray[currentSegment[0] - 1] = currentSegment[1];
    }

    // Join the elements of the outcome array into a single string.
    // Then, clean this string: first, remove any leading placeholder characters.
    // Second, replace any remaining placeholder characters within the string with '0'.
    const manipulatedString = outcomeArray.join("").replace(/^a*/, '').replace(/a/g, '0');

    // Convert the cleaned string to an integer and then immediately back to a string.
    // This step is crucial for handling cases where the string might represent a number with leading zeros,
    // effectively removing them if they are not significant.
    const numericalRepresentation = parseInt(manipulatedString).toString();

    // Evaluate the manipulated string to assign the final result based on specific conditions.
    if (manipulatedString === '00') {
        finalResult = 100; // Special case: if the string is '00', the result is 100.
    } else if (manipulatedString === '0') {
        finalResult = 10; // Special case: if the string is '0', the result is 10.
    } else if (manipulatedString === numericalRepresentation) {
        // If the manipulated string is identical to its integer-then-string conversion,
        // it means no significant leading zeros were removed, so parse it as an integer.
        finalResult = parseInt(numericalRepresentation);
    }

    // Output the computed final result to the console.
    console.log(finalResult);
}

// The following lines are responsible for reading input from standard input
// and invoking the main processing function. These should remain unaltered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
// ProcessInput(require('fs').readFileSync('./input.txt', 'utf-8'));
