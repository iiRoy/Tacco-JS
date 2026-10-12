function execute(sourceText) {
    const extractAndConvert = (allData) => {
        const dataLines = allData.split('\n');
        const totalItems = Number(dataLines[0]);
        const numericalSequence = dataLines[1].split(' ').map(Number);
        return { countOfItems: totalItems, itemValues: numericalSequence };
    };

    const generatePrefixSums = (sequence) => {
        let runningTotal = 0;
        return sequence.map(value => {
            runningTotal += value;
            return runningTotal;
        });
    };

    const obtainRangeSum = (prefixSumsArray, startPosition, endPosition) => {
        if (startPosition > endPosition) return 0;
        const sumToEndPosition = prefixSumsArray[endPosition];
        const sumBeforeStartPosition = (startPosition > 0) ? prefixSumsArray[startPosition - 1] : 0;
        return sumToEndPosition - sumBeforeStartPosition;
    };

    const computeFirstTwoPartitions = (totalItemCount, prefixSumsArray) => {
        const firstSegmentResults = [];
        let firstSplitIndex = 0; // Index of the last element of the first part

        // This loop iterates through possible split points between the second and third parts
        // (y_mid_idx_end_of_Q in my thought process, equivalent to `i` in original's first loop)
        // It ranges from 1 to N-3 (inclusive)
        for (let secondSegmentEnd = 1; secondSegmentEnd < totalItemCount - 2; ++secondSegmentEnd) {
            const currentCombinedSum = prefixSumsArray[secondSegmentEnd]; // Sum of elements from index 0 to secondSegmentEnd

            // The original code only attempts to advance `l` if `leftArr.length > 2`,
            // which means `secondSegmentEnd + 1 > 2`, or `secondSegmentEnd > 1`.
            if (secondSegmentEnd > 1) {
                // This inner loop greedily adjusts `firstSplitIndex` to minimize `abs(P_sum - Q_sum)`
                while (firstSplitIndex < secondSegmentEnd) { // `firstSplitIndex` must be less than `secondSegmentEnd`
                    const firstPartSumCurrent = prefixSumsArray[firstSplitIndex];
                    const secondPartSumCurrent = currentCombinedSum - firstPartSumCurrent;

                    const firstPartSumNext = prefixSumsArray[firstSplitIndex + 1];
                    const secondPartSumNext = currentCombinedSum - firstPartSumNext;
                    
                    if (Math.abs(firstPartSumNext - secondPartSumNext) <= Math.abs(firstPartSumCurrent - secondPartSumCurrent)) {
                        firstSplitIndex++;
                    } else {
                        break;
                    }
                }
            }
            firstSegmentResults.push({
                initialPortion: prefixSumsArray[firstSplitIndex],
                subsequentPortion: currentCombinedSum - prefixSumsArray[firstSplitIndex]
            });
        }
        return firstSegmentResults;
    };

    const computeLastTwoPartitions = (totalItemCount, prefixSumsArray) => {
        const secondSegmentResults = [];
        // The split point for the third and fourth parts (currentThirdSplitIndex in my thought process)
        // is re-initialized for each iteration of the outer loop, always starting at `N-2`.

        // This loop iterates through possible split points between the second and third parts
        // (y_mid_idx_start_of_R in my thought process, equivalent to `i` in original's second loop)
        // It ranges from N-2 down to 2 (inclusive)
        for (let thirdSegmentStart = totalItemCount - 2; thirdSegmentStart > 1; --thirdSegmentStart) {
            let currentThirdSplitIndex = totalItemCount - 2; // Index of the last element of the third part

            const fullArraySum = prefixSumsArray[totalItemCount - 1]; // Sum of all elements A[0...N-1]
            
            // The original code only attempts to advance `r` if `rightArr.length > 2`,
            // which means `(N - thirdSegmentStart) > 2`.
            if (totalItemCount - thirdSegmentStart > 2) {
                // This inner loop greedily adjusts `currentThirdSplitIndex` to minimize `abs(R_sum - S_sum)`
                while (currentThirdSplitIndex > thirdSegmentStart) { // `currentThirdSplitIndex` must be greater than `thirdSegmentStart`
                    const thirdPartSumCurrent = obtainRangeSum(prefixSumsArray, thirdSegmentStart, currentThirdSplitIndex);
                    const fourthPartSumCurrent = fullArraySum - prefixSumsArray[currentThirdSplitIndex];

                    const thirdPartSumPrev = obtainRangeSum(prefixSumsArray, thirdSegmentStart, currentThirdSplitIndex - 1);
                    const fourthPartSumPrev = fullArraySum - prefixSumsArray[currentThirdSplitIndex - 1];
                    
                    if (Math.abs(thirdPartSumPrev - fourthPartSumPrev) <= Math.abs(thirdPartSumCurrent - fourthPartSumCurrent)) {
                        currentThirdSplitIndex--;
                    } else {
                        break;
                    }
                }
            }
            secondSegmentResults.unshift({ // Replicate unshift to match original's order
                middlePortion: obtainRangeSum(prefixSumsArray, thirdSegmentStart, currentThirdSplitIndex),
                finalPortion: fullArraySum - prefixSumsArray[currentThirdSplitIndex]
            });
        }
        return secondSegmentResults;
    };

    const data = extractAndConvert(sourceText);
    const itemQuantity = data.countOfItems;
    const initialValues = data.itemValues;

    const cumulativeValueArray = generatePrefixSums(initialValues);

    const leftPartitions = computeFirstTwoPartitions(itemQuantity, cumulativeValueArray);
    const rightPartitions = computeLastTwoPartitions(itemQuantity, cumulativeValueArray);

    let smallestRange = -1;

    // This loop combines results from the two partition computations.
    // It's important to replicate the exact indexing of the original code,
    // which may imply a misalignment if my analysis of the original `i` variables was correct.
    for (let currentCombinationIndex = 0; currentCombinationIndex < leftPartitions.length; ++currentCombinationIndex) {
        const valAlpha = leftPartitions[currentCombinationIndex].initialPortion;
        const valBeta = leftPartitions[currentCombinationIndex].subsequentPortion;
        
        const valGamma = rightPartitions[currentCombinationIndex].middlePortion;
        const valDelta = rightPartitions[currentCombinationIndex].finalPortion;

        const currentMaximum = Math.max(valAlpha, valBeta, valGamma, valDelta);
        const currentMinimum = Math.min(valAlpha, valBeta, valGamma, valDelta);
        const currentDifference = currentMaximum - currentMinimum;

        if (smallestRange < 0 || currentDifference < smallestRange) {
            smallestRange = currentDifference;
        }
    }

    console.log(smallestRange);
}

execute(require("fs").readFileSync("/dev/stdin", "utf8"));