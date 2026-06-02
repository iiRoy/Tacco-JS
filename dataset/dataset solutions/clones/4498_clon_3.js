process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    const dataBuffer = process.stdin.read();

    if (dataBuffer === null) {
        return;
    }

    // Split the input buffer into individual lines
    const rawInputLines = dataBuffer.split('\n');
    let processedInputLines = [...rawInputLines]; // Create a mutable copy for modification

    // Replicate the original logic for handling a trailing empty line
    // If the last line is empty, remove it.
    if (processedInputLines.length > 0 && processedInputLines[processedInputLines.length - 1] === '') {
        processedInputLines.pop();
    }

    // Extract the count string and parse it into an integer.
    // Note: If processedInputLines[0] is an empty string, parseInt will yield NaN,
    // which correctly replicates the original's behavior of making 'n-1' evaluate to -1.
    const countStringValue = processedInputLines[0];
    const arrayLength = parseInt(countStringValue, 10);

    // Parse the second line into an array of numbers.
    // This will throw a TypeError if processedInputLines[1] is undefined,
    // which matches the original code's behavior for insufficient input lines.
    const numericValuesArray = processedInputLines[1].split(' ').map(Number);

    // Initialize arrays to collect elements for the two output segments.
    // These arrays will be used to build the final strings more efficiently than direct concatenation.
    const firstOutputSegmentElements = []; // Corresponds to the original 's1'
    const secondOutputSegmentElements = []; // Corresponds to the original 's2'

    // Iterate backward through the array, stepping by two, starting from the last element.
    let currentIterationIndex = arrayLength - 1;
    while (currentIterationIndex >= 0) {
        // Add the element at the current index to the first segment.
        firstOutputSegmentElements.push(numericValuesArray[currentIterationIndex]);

        // If there is a preceding element (i.e., currentIterationIndex - 1 is a valid index),
        // add it to the second segment. Using unshift ensures elements are added in reverse order
        // of their appearance in this loop, which effectively preserves their original relative order.
        if (currentIterationIndex - 1 >= 0) {
            secondOutputSegmentElements.unshift(numericValuesArray[currentIterationIndex - 1]);
        }

        // Move to the next element in the backward sequence.
        currentIterationIndex -= 2;
    }

    // Construct the final output strings, ensuring exact spacing matches the original.
    // The original code adds a trailing space to each segment if it's not empty.
    let finalOutputStringPartOne = '';
    if (firstOutputSegmentElements.length > 0) {
        finalOutputStringPartOne = firstOutputSegmentElements.join(' ') + ' ';
    }

    let finalOutputStringPartTwo = '';
    if (secondOutputSegmentElements.length > 0) {
        finalOutputStringPartTwo = secondOutputSegmentElements.join(' ') + ' ';
    }

    // Print the concatenated result to standard output.
    console.log(finalOutputStringPartOne + finalOutputStringPartTwo);
});
