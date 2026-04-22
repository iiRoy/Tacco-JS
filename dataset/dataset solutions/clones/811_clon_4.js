const outputFunc = console.log;

if (typeof process !== "undefined") {
    let acquiredDataBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (incomingSegment) => {
        acquiredDataBuffer += incomingSegment;
    });
    process.stdin.on('end', () => {
        processIncomingContent(acquiredDataBuffer);
    });
}

function processIncomingContent(rawContentString) {
    const allTextRows = rawContentString.split('\n');
    // The original code discards the first, second, and last lines of the input.
    // This slice operation achieves the same result concisely.
    const effectiveDataRows = allTextRows.slice(2, -1);
    executeCoreLogic(effectiveDataRows);
}

function executeCoreLogic(processedRowStrings) {
    // Convert string rows into arrays of floating-point numbers.
    const numericalCollections = processedRowStrings.map(rowString =>
        rowString.split(' ').map(parseFloat)
    );

    // Recursive function to group the numerical collections into pairs,
    // diverging from the original's imperative while loop with array shifts.
    function createPairedGroups(sourceList, resultAccumulator = []) {
        if (sourceList.length < 2) {
            return resultAccumulator;
        }
        const currentPair = sourceList.slice(0, 2);
        return createPairedGroups(sourceList.slice(2), [...resultAccumulator, currentPair]);
    }

    const groupedDataSets = createPairedGroups(numericalCollections);

    // Process each grouped dataset using a functional map, then log results.
    groupedDataSets.map(currentDataSet => {
        const configurationVector = currentDataSet[0];
        const observationSeries = currentDataSet[1];
        const elementsToRemoveCount = configurationVector[1];

        // Calculate differences between consecutive elements in the observation series.
        // This is a functional alternative to an imperative forEach loop.
        const sequentialDifferences = observationSeries.slice(1).map((currentValue, index) =>
            currentValue - observationSeries[index]
        );

        // Sort differences in descending order.
        const sortedDescendingDifferences = sequentialDifferences.sort((val1, val2) => val2 - val1);

        let finalDifferenceSet = sortedDescendingDifferences;
        // Remove the specified number of elements from the beginning of the sorted differences,
        // only if `elementsToRemoveCount` is greater than 1.
        // This replaces the original's for loop with multiple `shift()` calls.
        if (elementsToRemoveCount > 1) {
            finalDifferenceSet = sortedDescendingDifferences.slice(elementsToRemoveCount - 1);
        }

        // Calculate the sum of the remaining differences.
        // The initial value of 0 handles cases where `finalDifferenceSet` might be empty,
        // making the original's conditional `reduce` callback unnecessary.
        const calculatedTotal = finalDifferenceSet.reduce((accumulatorSum, diffValue) =>
            accumulatorSum + diffValue, 0
        );

        return calculatedTotal;
    }).forEach(outputFunc); // Output each calculated total.
}