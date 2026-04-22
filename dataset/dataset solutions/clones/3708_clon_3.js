function ProcessInputData(dataString) {
    // This function is designed to compute the minimal difference between the largest and smallest
    // sums of four contiguous sub-arrays, derived from an initial sequence of numbers.
    // The incoming `dataString` is expected to be a multi-line string:
    // The first line contains the total count of numbers (N).
    // The second line contains N space-separated integer values.

    // --- Data Parsing and Initial Setup ---

    // Split the input string into individual lines, handling various newline conventions.
    const inputContentLines = dataString.split(/\r?\n/);

    // Extract the total number of elements. The unary plus operator efficiently converts string to number.
    const totalElementCount = +inputContentLines[0];

    // Parse the second line to get the array of numeric values.
    // Each string element is converted to a number using the unary plus operator.
    const numericValueSequence = inputContentLines[1].split(' ').map(numStr => +numStr);

    // --- Pre-computation: Generate Cumulative Sums Array ---
    // A cumulative (or prefix) sum array allows for rapid calculation of the sum of any sub-array.
    // `cumulativeSums[k]` stores the sum of `numericValueSequence[0]` through `numericValueSequence[k]`.
    // The sum of elements from index `a` to `b` (inclusive) can then be found as `cumulativeSums[b] - cumulativeSums[a-1]`
    // (assuming `cumulativeSums[-1]` is 0).

    let runningTotalAccumulator = 0;
    const cumulativeSums = [];
    
    // Populate the cumulative sums array.
    for (const singleValue of numericValueSequence) {
        runningTotalAccumulator += singleValue;
        cumulativeSums.push(runningTotalAccumulator);
    }

    // --- Validation: Minimum Element Count ---
    // To form four non-empty contiguous segments, at least four elements are required.
    // This explicit check handles cases where the input array is too small.
    // In competitive programming, such edge cases might implicitly lead to specific outputs or crashes.
    // Adding this as a new fragment for robustness.
    if (totalElementCount < 4) {
        return -1; // Indicates an invalid state where 4 partitions cannot be formed.
    }


    // --- Intermediate Storage for Segment Sums ---
    // These arrays will hold the calculated sums for each of the four segments (P, Q, R, S)
    // across all valid configurations of split points.
    const segmentOneSums = [];   // Corresponds to P
    const segmentTwoSums = [];   // Corresponds to Q
    const segmentThreeSums = []; // Corresponds to R
    const segmentFourSums = [];  // Corresponds to S

    // --- Left-Side Partitioning: Determining P and Q Segments ---
    // This loop iterates through possible positions for the second split point (k2 in 0---k1---k2---k3---N-1).
    // `currentSecondSplitIdx` represents the index of the last element of the second segment (Q).
    // `currentFirstSplitIdx` tracks the optimal first split point (k1) for the current `currentSecondSplitIdx`.
    // This uses a greedy approach to balance P and Q.

    let currentFirstSplitIdx = 0; // Represents `l` in the original code.

    // `currentSecondSplitIdx` runs from 1 to `totalElementCount - 3`.
    // If `currentSecondSplitIdx` is `1`, `P` is `numericValueSequence[0]`, `Q` is `numericValueSequence[1]`.
    // If `currentSecondSplitIdx` is `totalElementCount - 3`, `P,Q` cover up to `totalElementCount - 3`.
    for (let currentSecondSplitIdx = 1; currentSecondSplitIdx < totalElementCount - 2; ++currentSecondSplitIdx) {
        // `sumOfFirstTwoSegments` is the sum of P and Q combined.
        const sumOfFirstTwoSegments = cumulativeSums[currentSecondSplitIdx];

        // This inner `while` loop adjusts `currentFirstSplitIdx` to find the optimal split
        // that minimizes the difference between P and Q for the current `sumOfFirstTwoSegments`.
        while (currentFirstSplitIdx < currentSecondSplitIdx) {
            // Calculate current P and Q sums based on `currentFirstSplitIdx`.
            const currentPSum = cumulativeSums[currentFirstSplitIdx];
            const currentQSum = sumOfFirstTwoSegments - currentPSum;

            // Check if moving `currentFirstSplitIdx` one step right is valid.
            if (currentFirstSplitIdx + 1 >= currentSecondSplitIdx) {
                break; // Cannot move `currentFirstSplitIdx` further right.
            }

            // Calculate potential P_next and Q_next sums if `currentFirstSplitIdx` is incremented.
            const nextPSum = cumulativeSums[currentFirstSplitIdx + 1];
            const nextQSum = sumOfFirstTwoSegments - nextPSum;

            // If moving `currentFirstSplitIdx` right improves or maintains balance, proceed.
            if (Math.abs(nextQSum - nextPSum) <= Math.abs(currentQSum - currentPSum)) {
                currentFirstSplitIdx++;
            } else {
                break; // Optimal `currentFirstSplitIdx` found for this `currentSecondSplitIdx`.
            }
        }
        // Store the determined sums for P and Q.
        segmentOneSums.push(cumulativeSums[currentFirstSplitIdx]);
        segmentTwoSums.push(sumOfFirstTwoSegments - cumulativeSums[currentFirstSplitIdx]);
    }

    // --- Right-Side Partitioning: Determining R and S Segments ---
    // This loop iterates through possible positions for the third split point (k3).
    // `currentThirdSplitOffset` acts as a relative pointer (like `r` in original) to determine k3.
    // It's initialized once and adjusted across outer loop iterations.

    let currentThirdSplitOffset = 1; // Corresponds to `r` in the original code, initialized to 1.

    // `mainSplitPointIdx` corresponds to `i` in the original R-loop.
    // It ranges from `totalElementCount - 2` down to `2`.
    for (let mainSplitPointIdx = totalElementCount - 2; mainSplitPointIdx > 1; --mainSplitPointIdx) {
        // `sumUpToSecondSplit` is the sum of elements up to the end of the P+Q segments.
        // This is `Aruisekiwa[i-1]` or `leftEnd` in the original code.
        const sumUpToSecondSplit = cumulativeSums[mainSplitPointIdx - 1];
        // `fullArrayTotalSum` is the sum of all elements in the `numericValueSequence`.
        const fullArrayTotalSum = cumulativeSums[totalElementCount - 1];

        // The inner `while` loop adjusts `currentThirdSplitOffset` to find the optimal split
        // that minimizes the difference between R and S.
        // This `if` condition ensures the `while` loop only runs when `mainSplitPointIdx`
        // is not at its maximum value (`totalElementCount - 2`), mimicking the original's `while(i < N-2)`.
        if (mainSplitPointIdx < totalElementCount - 2) {
            while (true) {
                // `currentRSEndIdx` is `i + r - 1` in the original, representing the index
                // of the last element of the R segment (before S begins).
                const currentRSEndIdx = mainSplitPointIdx + currentThirdSplitOffset - 1;

                // Ensure `currentRSEndIdx` is a valid split point (within bounds and after P+Q).
                if (currentRSEndIdx >= totalElementCount - 1 || currentRSEndIdx <= mainSplitPointIdx - 1) {
                    break; // Cannot move `currentThirdSplitOffset` further.
                }

                // Calculate current R and S sums.
                const currentRSum = cumulativeSums[currentRSEndIdx] - sumUpToSecondSplit;
                const currentSSum = fullArrayTotalSum - cumulativeSums[currentRSEndIdx];

                // Consider moving the split point one step to the left (decrementing `currentThirdSplitOffset`).
                const previousRSEndIdx = currentRSEndIdx - 1;

                // Ensure `previousRSEndIdx` is a valid point for comparison.
                if (previousRSEndIdx <= mainSplitPointIdx - 1) {
                    break;
                }

                // Calculate R_prev and S_prev sums.
                const previousRSum = cumulativeSums[previousRSEndIdx] - sumUpToSecondSplit;
                const previousSSum = fullArrayTotalSum - cumulativeSums[previousRSEndIdx];

                // If moving the split point left makes R and S more balanced (smaller or equal difference), do it.
                if (Math.abs(previousSSum - previousRSum) <= Math.abs(currentSSum - currentRSum)) {
                    currentThirdSplitOffset--;
                } else {
                    break; // Optimal position found for this `mainSplitPointIdx`.
                }
            }
        }
        // Store the determined sums for R and S.
        // `unshift` is used to prepend values, ensuring the arrays are in the correct order
        // to align with `segmentOneSums` and `segmentTwoSums`.
        segmentThreeSums.unshift(cumulativeSums[mainSplitPointIdx + currentThirdSplitOffset - 1] - sumUpToSecondSplit);
        segmentFourSums.unshift(fullArrayTotalSum - cumulativeSums[mainSplitPointIdx + currentThirdSplitOffset - 1]);
        
        // Increment `currentThirdSplitOffset` for the next iteration of the outer loop,
        // mirroring the `++r` behavior in the original `for` loop.
        currentThirdSplitOffset++;
    }

    // --- Final Step: Calculate Minimum Span Difference ---
    // Iterate through all possible combined partition configurations (P, Q, R, S)
    // and find the minimum value of (Max(P,Q,R,S) - Min(P,Q,R,S)).

    let overallMinimumSpan = Number.POSITIVE_INFINITY; // Initialize with the largest possible number.

    // All four segment arrays (`segmentOneSums`, etc.) should have the same length, `totalElementCount - 3`.
    // Each index `k` corresponds to a unique overall partitioning configuration.
    for (let k = 0; k < segmentOneSums.length; ++k) {
        const pValue = segmentOneSums[k];
        const qValue = segmentTwoSums[k];
        const rValue = segmentThreeSums[k];
        const sValue = segmentFourSums[k];

        // Determine the maximum and minimum sum among the four current segments.
        const currentMaxSegmentValue = Math.max(pValue, qValue, rValue, sValue);
        const currentMinSegmentValue = Math.min(pValue, qValue, rValue, sValue);

        // Calculate the "span" (the difference between the max and min segment sums).
        const currentConfigurationSpan = currentMaxSegmentValue - currentMinSegmentValue;

        // Update the overall minimum span found so far.
        overallMinimumSpan = Math.min(overallMinimumSpan, currentConfigurationSpan);
    }

    // Return the final calculated minimum span.
    return overallMinimumSpan;
}