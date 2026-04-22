function processInputSource(dataSource) {
    const linesOfData = dataSource.trim().split("\n");
    let currentReadPosition = 0;
    const computedOutcomes = [];

    const recurseThroughCases = () => {
        if (currentReadPosition >= linesOfData.length) {
            return; // All data processed
        }

        const currentLine = linesOfData[currentReadPosition];
        if (!currentLine || currentLine.trim() === '') { // Handle potential empty lines or end of input
            return;
        }

        const batchSize = Number(currentLine.split(" ")[0]);

        if (isNaN(batchSize) || batchSize === 0) { // Malformed or unexpected input
            return;
        }

        currentReadPosition++; // Advance past the batch size line

        const currentBatchEntries = [];
        for (let i = 0; i < batchSize; i++) {
            const entryLine = linesOfData[currentReadPosition + i];
            if (!entryLine) { // Handle unexpected end of input in a batch
                throw new Error("Unexpected end of input while reading batch entries.");
            }
            currentBatchEntries.push(entryLine.split(" ").map(Number));
        }
        currentReadPosition += batchSize; // Advance past all batch entries

        const batchResult = evaluateSingleBatch(batchSize, currentBatchEntries);
        computedOutcomes.push(batchResult);
        recurseThroughCases(); // Process the next batch
    };

    const evaluateSingleBatch = (totalCount, entryList) => {
        let initialAccumulation = 0;
        const firstCategoryItems = [];
        const secondCategoryItems = [];

        entryList.forEach(entry => {
            const [conditionKey, leftValue, rightValue] = entry;
            if (conditionKey === totalCount || leftValue === rightValue) {
                initialAccumulation += leftValue;
            } else if (leftValue > rightValue) {
                firstCategoryItems.push({ preferred: conditionKey, incrementalValue: leftValue - rightValue });
                initialAccumulation += rightValue;
            } else { // leftValue < rightValue
                secondCategoryItems.push({ preferred: totalCount - conditionKey, incrementalValue: rightValue - leftValue });
                initialAccumulation += rightValue;
            }
        });

        const activeItemCount = firstCategoryItems.length + secondCategoryItems.length;

        const performGreedyAssignment = (itemsForAssignment, availableSlotsLimit) => {
            itemsForAssignment.sort((a, b) => a.preferred - b.preferred);
            let currentIncrementalSum = 0;
            const allocatedIndices = new Set(); // Using a Set for allocated slots

            itemsForAssignment.forEach(item => {
                let desiredIndex = item.preferred - 1; // 0-indexed preference

                // Find the largest available slot <= desiredIndex
                while (desiredIndex >= 0 && allocatedIndices.has(desiredIndex)) {
                    desiredIndex--;
                }

                if (desiredIndex >= 0) {
                    allocatedIndices.add(desiredIndex);
                    currentIncrementalSum += item.incrementalValue;
                }
            });
            return currentIncrementalSum;
        };

        const firstCategoryIncrease = performGreedyAssignment(firstCategoryItems, activeItemCount);
        const secondCategoryIncrease = performGreedyAssignment(secondCategoryItems, activeItemCount);

        return initialAccumulation + firstCategoryIncrease + secondCategoryIncrease;
    };

    recurseThroughCases();
    computedOutcomes.forEach(outcome => console.log(outcome));
}

processInputSource(require("fs").readFileSync("/dev/stdin", "utf8"));