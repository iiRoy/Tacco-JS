const processInput = (rawText) => {
    const dataLines = rawText.trim().split('\n');
    const [itemCountString, targetValueString] = dataLines[0].split(' ');
    const numberOfItems = Number(itemCountString);
    const targetThreshold = Number(targetValueString);

    const numericalPairs = dataLines.slice(1, numberOfItems + 1).map(line => line.split(' ').map(Number));

    let runningSum = 0;
    const accumulatedSums = numericalPairs.map(item => {
        runningSum += item[1];
        return runningSum;
    });

    const transformedRecords = numericalPairs.map((pair, currentIdx) => {
        let calculatedMetric;
        if (currentIdx === 0) {
            calculatedMetric = accumulatedSums[0];
        } else {
            calculatedMetric = accumulatedSums[0] + accumulatedSums[currentIdx - 1];
        }
        return {
            elementId: pair[0],
            elementQuantity: pair[1],
            cumulativeEvaluation: calculatedMetric
        };
    });

    const firstMatchIndex = transformedRecords.findIndex(entry => entry.cumulativeEvaluation >= targetThreshold);

    if (firstMatchIndex !== -1) {
        const matchedRecord = transformedRecords[firstMatchIndex];
        let outcomeIdentifier;

        if (firstMatchIndex === 0) {
            outcomeIdentifier = matchedRecord.elementId;
        } else {
            if (matchedRecord.cumulativeEvaluation - matchedRecord.elementQuantity < targetThreshold) {
                outcomeIdentifier = matchedRecord.elementId;
            } else {
                outcomeIdentifier = transformedRecords[firstMatchIndex - 1].elementId;
            }
        }
        console.log(outcomeIdentifier);
    } else {
        console.log(JSON.stringify(transformedRecords));
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));