const analyzeDirectionalMisalignment = (inputPayload) => {
    // This function processes a raw input string to determine the minimum
    // cost to make a sequence "directional". The cost is defined as the
    // number of 'W' characters appearing to the left of a chosen pivot point
    // plus the number of 'E' characters appearing to the right of that pivot.

    // 1. Initial Data Parsing and Preparation
    // Split the entire input payload by newline characters and clean up whitespace.
    const processedInputLines = inputPayload.trim().split('\n');

    // The first line typically contains the length of the character sequence.
    const declaredSequenceLengthStr = processedInputLines.shift();
    const effectiveSequenceSize = parseInt(declaredSequenceLengthStr, 10);

    // Construct the primary character sequence from the remaining input lines.
    // This assumes the actual sequence is provided on subsequent lines.
    const directionalSequence = processedInputLines.join('');

    // A small validation check: ensure the parsed length is a valid number.
    // In competitive programming, input is usually guaranteed valid, so this is
    // often omitted but good practice for robust applications.
    if (isNaN(effectiveSequenceSize) || effectiveSequenceSize < 0) {
        // For robustness, one might throw an error or return a specific code.
        // For this specific problem context, we'll assume valid numeric input.
        // If the size is zero, the cost is naturally zero.
        if (effectiveSequenceSize === 0) {
            console.log(0);
            return;
        }
    }

    // 2. Pre-computation for Enhanced Efficiency (Type III Structural Change)
    // Instead of repeatedly slicing and counting characters in the main loop,
    // we pre-calculate prefix sums for 'W's and suffix sums for 'E's.

    // `prefixWestwardCounts[k]` stores the total 'W's in `directionalSequence[0...k-1]`.
    // `prefixWestwardCounts[0]` will be 0.
    const prefixWestwardCounts = new Array(effectiveSequenceSize + 1).fill(0);
    for (let charIndex = 0; charIndex < effectiveSequenceSize; charIndex++) {
        prefixWestwardCounts[charIndex + 1] = prefixWestwardCounts[charIndex];
        if (directionalSequence[charIndex] === 'W') {
            prefixWestwardCounts[charIndex + 1]++;
        }
    }

    // `suffixEastwardCounts[k]` stores the total 'E's in `directionalSequence[k...effectiveSequenceSize-1]`.
    // `suffixEastwardCounts[effectiveSequenceSize]` will be 0.
    const suffixEastwardCounts = new Array(effectiveSequenceSize + 1).fill(0);
    for (let charIndex = effectiveSequenceSize - 1; charIndex >= 0; charIndex--) {
        suffixEastwardCounts[charIndex] = suffixEastwardCounts[charIndex + 1];
        if (directionalSequence[charIndex] === 'E') {
            suffixEastwardCounts[charIndex]++;
        }
    }

    // Initialize the variable to track the globally minimum violation count.
    // The maximum possible violations is `effectiveSequenceSize` itself (e.g., all 'W's on right, all 'E's on left).
    let minimumObservedViolation = effectiveSequenceSize;

    // 3. Iteration Through All Possible Pivot Points
    // We iterate through each character in the sequence, considering it as the
    // "pivot" point. The character at `pivotCandidateIndex` is excluded from
    // both left and right segments for counting.
    // This loop runs `effectiveSequenceSize` times, for indices from `0` to `effectiveSequenceSize - 1`.
    for (let pivotCandidateIndex = 0; pivotCandidateIndex < effectiveSequenceSize; pivotCandidateIndex++) {
        // Calculate 'W's in the segment to the left of the current pivot.
        // This corresponds to `directionalSequence[0...pivotCandidateIndex-1]`.
        const currentWestwardViolations = prefixWestwardCounts[pivotCandidateIndex];

        // Calculate 'E's in the segment to the right of the current pivot.
        // This corresponds to `directionalSequence[pivotCandidateIndex+1...effectiveSequenceSize-1]`.
        const currentEastwardViolations = suffixEastwardCounts[pivotCandidateIndex + 1];

        // Sum the violations for the current split configuration.
        const totalCurrentViolations = currentWestwardViolations + currentEastwardViolations;

        // Type III: Early exit optimization. If a perfect split (zero violations)
        // is found, we can immediately declare it as the minimum and stop.
        if (totalCurrentViolations === 0) {
            minimumObservedViolation = 0;
            break;
        }

        // Update the minimum if the current configuration is better.
        if (totalCurrentViolations < minimumObservedViolation) {
            minimumObservedViolation = totalCurrentViolations;
        }
    }

    // 4. Final Output
    // Print the determined minimum number of directional violations to standard output.
    console.log(minimumObservedViolation);
};

// The entry point for execution: reads input from standard input,
// removes any leading/trailing whitespace, and passes it to the analyzer function.
analyzeDirectionalMisalignment(require("fs").readFileSync("/dev/stdin", "utf8"));