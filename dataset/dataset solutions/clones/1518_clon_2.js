const processInput = (inputString) => {
    // Parse the input string to extract numerical parameters.
    const [limitVal, initialVal, moduloVal] = inputString.split(" ").map(Number);

    // Initialize an array to store the sequence values.
    let sequenceValues = [...new Array(moduloVal)].fill(0);
    // Initialize an array to track the first occurrence index of each modulo value.
    let seenIndices = [...new Array(moduloVal)].fill(0);

    // Set the first element of the sequence.
    sequenceValues[0] = initialVal;
    // Record the index of the first element's value.
    seenIndices[initialVal] = 0;

    let idx = 1; // Current index for sequence generation.
    let cycleStartIdx = 0; // Index where a cycle begins.

    // Generate the sequence until a cycle is detected or the array limit is reached.
    for (; idx < moduloVal; idx++) {
        // Calculate the next value in the sequence: (previous_value^2) % moduloVal.
        sequenceValues[idx] = (sequenceValues[idx - 1] ** 2) % moduloVal;

        // Check if the current value has been seen before.
        if (seenIndices[sequenceValues[idx]] !== 0) {
            // A cycle is detected. Store the starting index of the cycle.
            cycleStartIdx = seenIndices[sequenceValues[idx]];
            break; // Exit the loop.
        } else {
            // If not seen, record the current index for this value.
            seenIndices[sequenceValues[idx]] = idx;
        }
    }

    // Determine the end index of the detected cycle.
    const cycleEndIdx = idx;
    // Calculate the length of the cycle.
    const cycleLength = cycleEndIdx - cycleStartIdx;
    // Calculate how many full times the cycle can repeat within the limitVal.
    const cycleIterations = cycleLength === 0 ? 0 : Math.floor(limitVal / cycleLength);

    let totalSum = 0; // Accumulator for the final sum.
    let currentCycleSum = 0; // Sum of elements within one cycle.

    // Calculate the sum of elements within the detected cycle.
    for (idx = cycleStartIdx; idx < cycleEndIdx; idx++) {
        currentCycleSum += sequenceValues[idx];
    }
    // Add the sum of full cycle repetitions to the total sum.
    totalSum += currentCycleSum * cycleIterations;

    // Add elements before the cycle starts to the total sum.
    for (idx = 0; idx < cycleStartIdx; idx++) {
        totalSum += sequenceValues[idx];
    }

    // Calculate the number of remaining elements after accounting for full cycles and pre-cycle elements.
    const remainingElements = cycleLength === 0 ? 0 : limitVal - cycleStartIdx - (cycleLength * cycleIterations);

    // Add the remaining elements from the beginning of the cycle to the total sum.
    for (idx = cycleStartIdx; idx < cycleStartIdx + remainingElements; idx++) {
        totalSum += sequenceValues[idx];
    }

    // Output the final calculated sum.
    console.log(totalSum);
};

// Example usage with hardcoded input.
processInput("1000 2 16");
