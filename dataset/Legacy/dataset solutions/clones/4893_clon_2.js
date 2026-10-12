function ProcessInput(rawData) {
    // Split the raw input string into lines
    rawData = rawData.split("\n");

    // Split the second line by spaces to get individual string tokens
    let parsedLine = rawData[1].split(" ");

    // Convert the first line to an integer, base 10
    const countVal = parseInt(rawData[0], 10);

    // Initialize an array with a size derived from countVal
    let initialSequence = new Array(2 * countVal - 1);

    // Log the initial count and the parsed string tokens for debugging/tracing
    console.log(countVal, parsedLine);

    // Populate the initialSequence array by parsing each token as an integer
    for (let idx = 0; idx < initialSequence.length; idx++) {
        initialSequence[idx] = parseInt(parsedLine[idx], 10);
    }

    // Log the fully parsed initial sequence
    console.log(initialSequence);

    /**
     * Computes the next sequence by taking the median of every three consecutive elements.
     * @param {Array<number>} currentSequence - The input array for the current iteration.
     * @returns {Array<number>} The new array containing medians.
     */
    function computeNextSequence(currentSequence) {
        // The next sequence will be shorter by 2 elements
        let nextIterationSequence = new Array(currentSequence.length - 2);

        // Iterate to fill the next sequence
        for (let subIdx = 0; subIdx < nextIterationSequence.length; subIdx++) {
            // Extract a sub-array of three elements
            let threeElements = currentSequence.slice(subIdx, subIdx + 3);

            // Sort the sub-array and pick the middle element (median)
            nextIterationSequence[subIdx] = threeElements.sort(
                function(elemA, elemB) {
                    // Custom comparison function for ascending order
                    return (elemA < elemB ? -1 : 1);
                }
            )[1]; // Index 1 is the median after sorting
        }
        return nextIterationSequence;
    }

    // Start the iterative process with the initial sequence
    let currentSequence = initialSequence;

    // Continue processing until only one element remains in the sequence
    while (currentSequence.length > 1) {
        // Compute the next sequence
        currentSequence = computeNextSequence(currentSequence);
        // Log the sequence after each iteration
        console.log(currentSequence);
    }

    // Output the final answer, which is the single remaining element
    console.log('the answer is %d', currentSequence[0]);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
