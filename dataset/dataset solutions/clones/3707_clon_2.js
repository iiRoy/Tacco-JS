function ProcessInput(rawData) {
    // Divide the incoming data into separate lines
    const parsedLines = rawData.split('\n');

    // Extract the total count of numerical elements from the first line
    const totalElements = parseInt(parsedLines[0], 10);

    // Convert the space-separated string of numbers from the second line into an array of integers
    const initialNumbers = parsedLines[1].split(' ').map(numString => parseInt(numString, 10));

    // Compute the cumulative sum array (prefix sums) for efficient range queries
    let runningTotal = 0;
    const prefixSums = initialNumbers.map((currentValue) => {
        runningTotal += currentValue; // Add current value to the running total
        return runningTotal;          // Store the updated running total
    });

    // Initialize arrays to hold the sums of the four segments (analogous to P, Q, R, S)
    const segmentOne = [];
    const segmentTwo = [];
    const segmentThree = [];
    const segmentFour = [];

    // --- First pass: Determine optimal splits for the left two segments ---
    // 'splitPointIdx' marks the end of the combined first two segments.
    // 'innerSplitIdx' tracks the best division point within these two segments.
    for (let splitPointIdx = 1, innerSplitIdx = 0; splitPointIdx < totalElements - 2; ++splitPointIdx) {
        // Obtain the current portion of the prefix sums array relevant to the left segments
        const currentLeftPortion = prefixSums.slice(0, splitPointIdx + 1);
        // The sum of all elements in the current left portion
        const currentLeftPortionSum = currentLeftPortion[currentLeftPortion.length - 1];

        // Calculate the sums of the two sub-segments based on the current 'innerSplitIdx'
        const firstSubSegmentSum = currentLeftPortion[innerSplitIdx];
        const secondSubSegmentSum = currentLeftPortionSum - firstSubSegmentSum;

        // Calculate the sums if 'innerSplitIdx' were advanced one position
        const firstSubSegmentSumNext = currentLeftPortion[innerSplitIdx + 1];
        const secondSubSegmentSumNext = currentLeftPortionSum - firstSubSegmentSumNext;

        // If advancing 'innerSplitIdx' results in a more balanced split (smaller difference), update it
        if (currentLeftPortion.length > 2 && Math.abs(secondSubSegmentSumNext - firstSubSegmentSumNext) <= Math.abs(secondSubSegmentSum - firstSubSegmentSum)) {
            ++innerSplitIdx;
        }

        // Store the sums of the optimally split first and second segments
        segmentOne.push(currentLeftPortion[innerSplitIdx]);
        segmentTwo.push(currentLeftPortionSum - currentLeftPortion[innerSplitIdx]);
    }

    // --- Second pass: Determine optimal splits for the right two segments ---
    // 'splitPointIdx' marks the beginning of the combined last two segments (iterating backwards).
    // 'innerSplitIdx' tracks the best division point within these two segments.
    for (let splitPointIdx = totalElements - 2, innerSplitIdx = 1; splitPointIdx > 1; --splitPointIdx, ++innerSplitIdx) {
        // Obtain the current portion of the prefix sums array relevant to the right segments
        const currentRightPortion = prefixSums.slice(splitPointIdx);
        // The prefix sum value just before the start of the current right portion
        const precedingSumValue = prefixSums.slice(splitPointIdx - 1, splitPointIdx)[0];
        // The total sum of the current right portion (from its start to its end)
        const currentRightPortionSum = currentRightPortion[currentRightPortion.length - 1];

        // Calculate the sums of the two sub-segments based on the current 'innerSplitIdx'
        // Note: currentRightPortion[innerSplitIdx] is a prefix sum, so subtract precedingSumValue
        const thirdSubSegmentSum = currentRightPortion[innerSplitIdx] - precedingSumValue;
        const fourthSubSegmentSum = currentRightPortionSum - currentRightPortion[innerSplitIdx];

        // Calculate the sums if 'innerSplitIdx' were retreated one position
        const thirdSubSegmentSumPrev = currentRightPortion[innerSplitIdx - 1] - precedingSumValue;
        const fourthSubSegmentSumPrev = currentRightPortionSum - currentRightPortion[innerSplitIdx - 1];

        // If retreating 'innerSplitIdx' results in a more balanced split, update it
        if (currentRightPortion.length > 2 && Math.abs(fourthSubSegmentSumPrev - thirdSubSegmentSumPrev) <= Math.abs(fourthSubSegmentSum - thirdSubSegmentSum)) {
            --innerSplitIdx;
        }

        // Store the sums of the optimally split third and fourth segments.
        // 'unshift' is used to maintain the correct order relative to segmentOne/segmentTwo.
        segmentThree.unshift(currentRightPortion[innerSplitIdx - 1] - precedingSumValue);
        segmentFour.unshift(currentRightPortionSum - currentRightPortion[innerSplitIdx - 1]);
    }

    // --- Final pass: Determine the overall minimum difference ---
    let overallMinimumDifference = -1; // Initialize with a sentinel value

    // Iterate through all possible valid configurations of the four segments
    for (let k = 0; k < segmentOne.length; ++k) {
        // Calculate the difference between the maximum and minimum sum among the four segments
        const currentConfigurationDifference = Math.max(segmentOne[k], segmentTwo[k], segmentThree[k], segmentFour[k]) -
                                               Math.min(segmentOne[k], segmentTwo[k], segmentThree[k], segmentFour[k]);

        // Update the overall minimum difference if the current configuration yields a smaller difference
        if (overallMinimumDifference < 0 || currentConfigurationDifference < overallMinimumDifference) {
            overallMinimumDifference = currentConfigurationDifference;
        }
    }

    // Print the final calculated minimum difference to standard output
    console.log(overallMinimumDifference);
}

// Read the entire content from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
