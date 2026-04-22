// This function initiates the processing of incoming textual data.
function ProcessInputData(sourceContent) {
    // The sourceContent is first split into individual lines.
    sourceContent = sourceContent.split("\n");
    let valueStrings = sourceContent[1].split(" ");

    // Parse the first line's content into an integer for the primary count.
    // The base 10 is specified for explicit decimal conversion.
    const elementSize = parseInt(sourceContent[0], 10);
    let originalNumbers = new Array(2 * elementSize - 1);

    // Populate the array with values from the second line of the input.
    for (let loopIndex = 0; loopIndex < originalNumbers.length; loopIndex++) {
        originalNumbers[loopIndex] = valueStrings[loopIndex];
    }

    // Defines a helper routine to generate the next sequence of numbers.
    // This routine takes a sequence and processes it to produce a new, shorter sequence.
    function deriveSubArray(inputSlice) {
        let nextSequence = new Array(inputSlice.length - 2);

        // Iterate through the input slice, taking a three-element window at a time.
        for (let iterationCounter = 0; iterationCounter < nextSequence.length; iterationCounter++) {
            // Extract a three-element segment from the current sequence.
            let tempSegment = inputSlice.slice(iterationCounter, iterationCounter + 3);

            // Sort the segment and pick the middle element (median of three).
            nextSequence[iterationCounter] = tempSegment.sort(
                function (valA, valB) {
                    // Custom comparison for numerical sorting.
                    return (Number(valA) < Number(valB) ? -1 : 1);
                }
            )[1]; // The element at index 1 is the median after sorting.
        }
        return nextSequence;
    }

    let currentSequence = originalNumbers;

    // Continuously reduce the sequence until only one element remains.
    while (currentSequence.length > 1) {
        currentSequence = deriveSubArray(currentSequence);
    }
    // The final remaining element is logged to the console.
    console.log('%d', currentSequence[0]);
}

// The following line is for standard input/output handling and should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));