const processInput = (inputString) => {
    // Deconstruct the input string into numerical parameters: total elements, initial value, and modulo base.
    const [totalElements, initialValue, moduloBase] = inputString.split(" ").map(Number);

    // Initialize an array to store the computed sequence values.
    // Its size is determined by the modulo base, and it's pre-filled with zeros.
    let sequenceValues = [...new Array(moduloBase)].fill(0);
    // Initialize another array to keep track of the first index at which each modulo result appears.
    // This helps in detecting cycles.
    let seenIndices = [...new Array(moduloBase)].fill(0);

    // Set the very first element of our sequence.
    sequenceValues[0] = initialValue;
    // Mark the initial value's first occurrence at index 0 in our tracking array.
    seenIndices[initialValue] = 0;

    let currentIdx = 1; // Begin generating the sequence from the second element.
    let cycleStartIdx = 0; // This will store the starting index of any detected cycle.

    // Iterate to generate sequence elements until a cycle is found or the array capacity is reached.
    for (; currentIdx < moduloBase; currentIdx++) {
        // Compute the next sequence value: square the previous value and take it modulo the base.
        sequenceValues[currentIdx] = (sequenceValues[currentIdx - 1] ** 2) % moduloBase;

        // Check if the newly computed value has been encountered before.
        if (seenIndices[sequenceValues[currentIdx]] !== 0) {
            // If it has, a cycle is identified.
            // The cycle begins at the index where this value was first recorded.
            cycleStartIdx = seenIndices[sequenceValues[currentIdx]];
            break; // Terminate the loop as the cycle's start is known.
        } else {
            // If this value is new, record its current index in the tracking array.
            seenIndices[sequenceValues[currentIdx]] = currentIdx;
        }
    }

    // The index where the cycle concludes (exclusive).
    const cycleEndIdx = currentIdx;

    // Determine the length of the detected cycle.
    const cycleLength = cycleEndIdx - cycleStartIdx;
    // Calculate how many full repetitions of this cycle can fit within the total number of elements.
    const cycleIterations = Math.floor(totalElements / cycleLength);

    let finalSum = 0; // The cumulative sum to be outputted.
    let cycleSum = 0; // The sum of all elements within a single cycle.

    // Sum up all the elements that constitute one full cycle.
    for (currentIdx = cycleStartIdx; currentIdx < cycleEndIdx; currentIdx++) {
        cycleSum += sequenceValues[currentIdx];
    }

    // Add the contribution of all full cycle repetitions to the total sum.
    finalSum += cycleSum * cycleIterations;

    // Add the elements that appear before the cycle begins.
    for (currentIdx = 0; currentIdx < cycleStartIdx; currentIdx++) {
        finalSum += sequenceValues[currentIdx];
    }

    // Calculate the number of elements remaining after accounting for pre-cycle elements and full cycles.
    const remainingElements = totalElements - cycleStartIdx - (cycleEndIdx - cycleStartIdx) * cycleIterations;

    // Add the remaining elements, which are taken from the beginning of the cycle.
    for (currentIdx = cycleStartIdx; currentIdx < cycleStartIdx + remainingElements; currentIdx++) {
        finalSum += sequenceValues[currentIdx];
    }

    // Display the final computed sum to standard output.
    console.log(finalSum);
};

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
