function ProcessInput(rawData) {
    // Split the entire input string into an array of lines
    const lines = rawData.split("\n");

    // Parse the first line to extract the two main numerical parameters
    const firstLineParts = lines[0].split(" ");
    const numElements = parseInt(firstLineParts[0], 10); // N: Number of elements
    const numIterations = parseInt(firstLineParts[1], 10); // K: Number of iterations

    // Extract the array of string elements from the second line
    const elementArray = lines[1].split(" ");

    // Initialize an array to store the calculated jump distances for each element
    const jumpLengths = new Array(numElements);

    // Create a concatenated version of the element array (A + A)
    // This helps in finding the next occurrence of an element within a circular context
    const doubledArray = elementArray.concat(elementArray);

    // Calculate the "jump length" for each element in the original array
    // The jump length is the distance to the next identical element in the doubled array,
    // starting from the position immediately after the current element.
    for (let idx = 0; idx < numElements; idx++) {
        // Slice the doubled array starting from the element after the current one
        const slicedPart = doubledArray.slice(idx + 1);
        // Find the index of the current element in this sliced part, then add 1
        // to get the actual offset from the current element's position.
        const nextOccurrenceOffset = slicedPart.indexOf(elementArray[idx]) + 1;
        jumpLengths[idx] = nextOccurrenceOffset;
    }

    // Simulate the K iterations to determine the final starting point
    let currentPosition = 0; // Tracks the current position in the conceptual infinite sequence
    let lastValidPosition = 0; // Stores the last position before exceeding N*K
    while (currentPosition < numElements * numIterations) {
        lastValidPosition = currentPosition;
        // Advance the current position by the jump length corresponding to the element
        // at the current position (modulo N) plus one (for the element itself).
        currentPosition += jumpLengths[currentPosition % numElements] + 1;
    }

    // Calculate the effective starting offset within the original element array
    // This is the remainder of the last valid position divided by N.
    const startOffset = lastValidPosition % numElements;

    // Create a new segment of the element array, starting from the calculated offset
    const processedSegment = elementArray.slice(startOffset);

    // Initialize an array to store the final unique elements that will be printed
    const finalUniqueElements = [];

    // Iterate through the processed segment to identify and collect unique elements.
    // An element is considered unique if it does not appear again later in the segment.
    let segmentIndex = 0;
    while (segmentIndex < processedSegment.length) {
        // Get the sub-segment starting from the element after the current one
        const remainingSegment = processedSegment.slice(segmentIndex + 1);
        // Check if the current element exists in the remaining part of the segment
        const occurrenceInRemaining = remainingSegment.indexOf(processedSegment[segmentIndex]);

        if (occurrenceInRemaining === -1) {
            // If the element does not appear again, it's unique in this context; add it to the result
            finalUniqueElements.push(processedSegment[segmentIndex]);
            segmentIndex++; // Move to the next element
        } else {
            // If the element appears again, skip all elements up to and including that next occurrence.
            // The +2 accounts for the current element and the found element itself.
            segmentIndex += occurrenceInRemaining + 2;
        }
    }

    // Print the collected unique elements, joined by spaces
    console.log(finalUniqueElements.join(" "));
}

// Read the input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
