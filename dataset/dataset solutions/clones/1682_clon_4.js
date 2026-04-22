const processInputData = (rawData) => {
    const dataLines = rawData.trim().split('\n');
    let currentLineCursor = 0;
    const allProblemSets = [];

    while (currentLineCursor < dataLines.length) {
        const firstLineParts = dataLines[currentLineCursor].split(' ');
        const numberOfElements = Number(firstLineParts[0]);
        if (isNaN(numberOfElements) || numberOfElements === 0) break;

        const currentElements = dataLines.slice(currentLineCursor + 1, currentLineCursor + 1 + numberOfElements)
                                         .map(str => str.split(' ').map(Number));
        
        let initialOutcome = 0;
        const groupOneSelections = [];
        const groupTwoSelections = [];

        currentElements.forEach(itemInfo => {
            const [point, lowerBound, upperBound] = itemInfo;
            if (point === numberOfElements || lowerBound === upperBound) {
                initialOutcome += lowerBound;
            } else if (lowerBound > upperBound) {
                groupOneSelections.push({
                    position: point - 1,
                    valueIncrease: lowerBound - upperBound,
                    baseValue: upperBound
                });
                initialOutcome += upperBound;
            } else {
                groupTwoSelections.push({
                    position: numberOfElements - point - 1,
                    valueIncrease: upperBound - lowerBound,
                    baseValue: lowerBound
                });
                initialOutcome += lowerBound;
            }
        });

        allProblemSets.push({
            totalSize: numberOfElements,
            initialResult: initialOutcome,
            primaryChoices: groupOneSelections,
            secondaryChoices: groupTwoSelections
        });

        currentLineCursor += numberOfElements + 1;
    }
    return allProblemSets;
};

const maximizeProfit = (decisionItems) => {
    if (decisionItems.length === 0) return 0;

    const orderedDecisions = [...decisionItems].sort((a, b) => a.position - b.position);

    const uniqueMarkers = [...new Set(decisionItems.map(item => item.position))]
                            .sort((a, b) => a - b);

    const usageLedger = uniqueMarkers.reduce((ledger, marker, index) => {
        const precedingMarker = (index === 0) ? -1 : uniqueMarkers[index - 1];
        ledger.set(marker, { totalCapacity: marker - precedingMarker, usedCount: 0 });
        return ledger;
    }, new Map());

    let totalExtraProfit = 0;

    const findAndOccupySlot = (targetIndexInMarkers, currentLedger) => {
        if (targetIndexInMarkers < 0) return null;

        const currentMarker = uniqueMarkers[targetIndexInMarkers];
        const slotRecord = currentLedger.get(currentMarker);

        if (slotRecord.usedCount < slotRecord.totalCapacity) {
            slotRecord.usedCount++;
            return slotRecord;
        } else {
            return findAndOccupySlot(targetIndexInMarkers - 1, currentLedger);
        }
    };

    for (const decision of orderedDecisions) {
        let startingMarkerIndex = uniqueMarkers.findIndex(m => m === decision.position);
        const allocatedSlot = findAndOccupySlot(startingMarkerIndex, usageLedger);

        if (allocatedSlot) {
            totalExtraProfit += decision.valueIncrease;
        }
    }

    return totalExtraProfit;
};


const masterFunction = (inputContent) => {
    const preparedProblemSets = processInputData(inputContent);
    const results = preparedProblemSets.map(problem => {
        const profitFromPrimary = maximizeProfit(problem.primaryChoices);
        const profitFromSecondary = maximizeProfit(problem.secondaryChoices);
        return problem.initialResult + profitFromPrimary + profitFromSecondary;
    });
    return results.join('\n');
};

const entryPoint = (source) => {
    const finalOutputs = masterFunction(source);
    console.log(finalOutputs);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));