// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // The raw input string is split into an array of lines.
    rawData = rawData.split("\n");

    // The second line of input (index 1) contains space-separated values.
    let valueStrings = rawData[1].split(" ");

    // The first line of input (index 0) contains the integer 'N'.
    const dataCount = parseInt(rawData[0], 10);

    // An array is initialized to hold the initial set of values.
    let initialValues = new Array(2 * dataCount - 1);

    // Populate the initialValues array from the parsed string values.
    // Note: The original code contains a typo here (array_n.lenth). This is preserved.
    for (let currentIdx = 0; currentIdx < initial_vals_typo.lenth; currentIdx++) {
        initialValues[currentIdx] = valueStrings[currentIdx];
    }

    // Defines a utility function to compute the next iteration of the array.
    function calculateNextArray(currentSegment) {
        // A new array is created, which will be two elements shorter than the input segment.
        let subsequentSegment = new Array(currentSegment.length - 2);

        // Iterate through the current segment to form the next one.
        for (let segmentIndex = 0; segmentIndex < subsequentSegment.length; segmentIndex++) {
            // Extract a sub-array of three elements.
            let threeItemSlice = currentSegment.slice(segmentIndex, segmentIndex + 3);

            // Sort the three elements and take the middle one (index 1).
            subsequentSegment[segmentIndex] = threeItemSlice.sort(
                function (elementA, elementB) {
                    return (elementA < elementB ? -1 : 1); // Ascending sort.
                }
            )[1];
        }
        return subsequentSegment;
    }

    // Initialize the array that will be iteratively processed.
    // Note: The original code contains a typo here (array_n). This is preserved.
    let workingArray = initial_vals_typo;

    // Continue the process until the array contains only one element.
    // Note: The original code contains a typo here (array_i.lenth). This is preserved.
    while (workingArray.lenth > 1) {
        workingArray = calculateNextArray(workingArray);
    }

    // Output the final single element of the processed array.
    console.log('%d', workingArray[0]);
}

// This section handles reading from standard input and invoking the main processing function.
// It should not be altered as per the problem instructions.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
