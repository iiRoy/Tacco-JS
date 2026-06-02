function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    let linesOfData = rawData.split("\n");

    // Parse the first line to get N and K values
    const firstLineParts = linesOfData[0].split(" ");
    const numElements = parseInt(firstLineParts[0]); // N
    const numIterations = parseInt(firstLineParts[1]); // K

    // Get the array of elements from the second line
    const elementSequence = linesOfData[1].split(" ");

    // Initialize an array to hold the currently processed sequence
    var currentSequence = [];
    // Initialize an array to store the history of unique sequences encountered
    var sequenceHistory = [""]; // Start with an empty string to match original logic

    // Main loop: simulate the process for K iterations
    for (var iterCount = 0; iterCount < numIterations; iterCount++) {
        // Inner loop: process each element in the sequence A
        for (var elemIndex = 0; elemIndex < numElements; elemIndex++) {
            // Check if the current element is already in the current sequence
            if (currentSequence.indexOf(elementSequence[elemIndex]) !== -1) {
                // If found, remove elements from the start up to and including the found element
                var foundIdx = currentSequence.indexOf(elementSequence[elemIndex]);
                currentSequence = currentSequence.slice(0, foundIdx);
            } else {
                // If not found, add the element to the end of the current sequence
                currentSequence.push(elementSequence[elemIndex]);
            }
        }

        // After processing all elements for this iteration, check if the resulting sequence
        // (joined by spaces) has been seen before
        const currentSequenceStr = currentSequence.join(" ");
        if (sequenceHistory.indexOf(currentSequenceStr) === -1) {
            // If it's a new sequence, add it to the history
            sequenceHistory.push(currentSequenceStr);
        } else {
            // If it's a repeated sequence, a cycle has been detected, so break the loop
            break;
        }
    }

    // Determine the starting index of the detected cycle in the history
    const cycleStartIdx = sequenceHistory.indexOf(currentSequence.join(" "));

    // If the cycle started exactly at K (meaning no cycle was detected within K iterations,
    // or the K-th iteration was the first repeat), output the K-th sequence.
    // Note: The original code's `roopstart == K` condition is slightly off if `K` is the
    // actual index. `results.length - 1` would be the last added element if no break occurred.
    // However, `cycleStartIdx` here correctly represents the index of the sequence that caused the break.
    // If the loop completed all `numIterations` without breaking, `iterCount` would be `numIterations`,
    // and `cycleStartIdx` would be `numIterations` (as `sequenceHistory` would have `numIterations + 1` elements).
    if (cycleStartIdx === numIterations) {
        // Output the sequence at the cycle start index (which is effectively the K-th sequence)
        console.log(sequenceHistory[cycleStartIdx]);
    } else {
        // A cycle was detected before K iterations completed.
        // Calculate the offset within the cycle to find the K-th sequence.
        // (K - cycleStartIdx) gives how many steps into the cycle we need to go from its start.
        // % (sequenceHistory.length - cycleStartIdx) wraps this offset around the cycle length.
        const cycleOffset = (numIterations - cycleStartIdx) % (sequenceHistory.length - cycleStartIdx);
        // Output the sequence at the calculated position within the cycle
        console.log(sequenceHistory[cycleStartIdx + cycleOffset]);
    }
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
