// A small utility function to perform numerical comparison for sorting.
// It ensures that elements are sorted in ascending order.
const numericalComparator = (firstElement, secondElement) => {
    // This expression calculates the difference between the two numbers.
    // A negative result means firstElement comes before secondElement.
    // A positive result means firstElement comes after secondElement.
    // Zero means their relative order does not change.
    return firstElement - secondElement;
};

// The primary routine responsible for processing the incoming data stream.
function processInputData(sourceContent) {

    // Divide the entire input content into an array of distinct lines.
    const contentLines = sourceContent.split("\n");

    // Extract and parse the initial configuration parameters from the first line.
    const initialParameters = contentLines[0].split(" ");

    // Determine the total count of items in the main sequence.
    // The unary plus operator efficiently converts the string to a numeric type.
    let totalItemCount = +initialParameters[0];

    // Establish the required length for each sub-segment or window.
    let segmentDesiredLength = +initialParameters[1];

    // Convert the second line of input into an array of numbers.
    // Each string value from the split operation is transformed into a number.
    let mainNumericSequence = contentLines[1].split(" ").map(itemString => +itemString);

    // This data structure will accumulate the stringified versions of all modified sequences.
    let finalStringResults = [];

    // Begin iterating through the main numeric sequence to generate and process sub-segments.
    // The loop continues as long as a complete segmentDesiredLength window can be formed.
    for (let currentPosition = 0; currentPosition <= totalItemCount - segmentDesiredLength; ++currentPosition) {

        // Isolate a specific window (segment) of the main sequence.
        let workingSegment = mainNumericSequence.slice(currentPosition, currentPosition + segmentDesiredLength);

        // Arrange the elements within this working segment in ascending numerical order.
        workingSegment.sort(numericalComparator);

        // Reconstruct the full sequence by concatenating three parts:
        // 1. The portion of the main sequence before the current window.
        // 2. The numerically sorted working segment.
        // 3. The portion of the main sequence after the current window.
        // Finally, convert this entire reconstructed array into a single string.
        finalStringResults[currentPosition] = mainNumericSequence.slice(0, currentPosition)
                                                    .concat(workingSegment)
                                                    .concat(mainNumericSequence.slice(currentPosition + segmentDesiredLength))
                                                    .toString();
    }

    // Create a Set object to automatically identify and store only the unique results
    // from the collection of generated strings. Sets inherently prevent duplicates.
    const distinctResultSet = new Set(finalStringResults);

    // Print the final count of unique string arrangements to the standard output.
    console.log(distinctResultSet.size);
}

// Execute the main processing routine by providing it with data
// obtained from the standard input stream.
// The 'require' statement loads the Node.js file system module.
// 'readFileSync' performs a synchronous read operation on the specified file path.
// '/dev/stdin' is a standard Unix-like path for reading from standard input.
// 'utf8' specifies the character encoding for the text data.
processInputData( require("fs").readFileSync("/dev/stdin", "utf8") );