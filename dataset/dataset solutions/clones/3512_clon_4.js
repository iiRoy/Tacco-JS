function determineMinimumReplacementsFromMap(frequencyMap) {
    let maximumFrequency = 0;
    let totalEntries = 0;

    // Iterate through the counts in the frequency map to find the highest frequency
    // and sum all counts to get the total number of elements represented in the map.
    Object.values(frequencyMap).forEach(currentCount => {
        totalEntries += currentCount;
        if (currentCount > maximumFrequency) {
            maximumFrequency = currentCount;
        }
    });

    // If the map is empty (e.g., for an empty group of values), no replacements are needed.
    if (totalEntries === 0) {
        return 0;
    }

    // The minimum number of replacements required to make all elements in this group
    // identical to the most frequent one is the total number of elements minus
    // the count of that most frequent element.
    return totalEntries - maximumFrequency;
}

function processInputSequence(sourceText) {
    const dataSegments = sourceText.split("\n");
    const totalElements = parseInt(dataSegments[0], 10);
    const valueSeries = dataSegments[1].split(" ");

    // First, check for a special case: if all elements in the entire sequence are identical.
    // This check must consider only the actual elements, not potential 'undefined' values.
    let isEntirelyUniform = true;
    const firstValue = valueSeries[0];
    if (totalElements > 0) {
        for (let index = 0; index < totalElements; index++) {
            if (valueSeries[index] !== firstValue) {
                isEntirelyUniform = false;
                break;
            }
        }
    } else {
        // An empty sequence is considered uniformly identical.
        isEntirelyUniform = true;
    }

    // If all elements are the same (e.g., "1 1 1 1"), the goal is to make them alternate
    // (e.g., "1 2 1 2"). This requires changing half of the elements.
    if (isEntirelyUniform) {
        return totalElements / 2;
    }

    // Initialize frequency maps for elements at even and odd positions.
    // These maps will store counts of values found at their respective positions.
    const evenPositionFrequencies = {}; // Corresponds to v[0], v[2], v[4]...
    const oddPositionFrequencies = {};  // Corresponds to v[1], v[3], v[5]...

    // The original code's loop iterates `n/2` times. If `n` is odd, `n/2` is a float,
    // and the loop runs `Math.ceil(n/2)` times, potentially accessing `vArray[n]` (undefined).
    const iterationCount = Math.ceil(totalElements / 2);

    for (let i = 0; i < iterationCount; i++) {
        const currentEvenIndexValue = valueSeries[i * 2];
        const currentOddIndexValue = valueSeries[i * 2 + 1]; // Can be undefined if totalElements is odd

        // Populate frequency maps. 'undefined' values are also counted if they appear.
        evenPositionFrequencies[currentEvenIndexValue] = (evenPositionFrequencies[currentEvenIndexValue] || 0) + 1;
        oddPositionFrequencies[currentOddIndexValue] = (oddPositionFrequencies[currentOddIndexValue] || 0) + 1;
    }

    // Calculate the minimum replacements needed for each group independently.
    // This strategy implicitly assumes that the most frequent element chosen for the
    // even positions will be different from the most frequent element chosen for
    // the odd positions, which is the correct approach when `isEntirelyUniform` is false.
    const replacementsForEvenPositions = determineMinimumReplacementsFromMap(evenPositionFrequencies);
    const replacementsForOddPositions = determineMinimumReplacementsFromMap(oddPositionFrequencies);

    // The total minimum changes is the sum of changes for both groups.
    return replacementsForEvenPositions + replacementsForOddPositions;
}

console.log(processInputSequence(require("fs").readFileSync("/dev/stdin", "utf8")));
