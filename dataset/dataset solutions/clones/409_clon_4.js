const initialDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

function evaluateCase(caseDataRows, numItems) {
    let itemRegistry = [];
    for (let currentItemIndex = 0; currentItemIndex < numItems; currentItemIndex++) {
        const itemComponents = caseDataRows[currentItemIndex].split(' ');
        itemRegistry.push({
            identification: itemComponents[0],
            payloadValue: Number(itemComponents[1]),
            limitValue: Number(itemComponents[2])
        });
    }

    itemRegistry.sort((first, second) => second.payloadValue - first.payloadValue);

    let maximumRatioFound = -1.0;
    let optimalSequenceLabels = [];

    const explorationStack = [{
        pathElements: [],
        availableIndices: new Set(Array.from({ length: numItems }, (_, k) => k)),
        totalPayloadAccumulated: 0,
        weightedPositionSumAccumulated: 0
    }];

    while (explorationStack.length > 0) {
        const {
            pathElements,
            availableIndices,
            totalPayloadAccumulated,
            weightedPositionSumAccumulated
        } = explorationStack.pop();

        if (availableIndices.size === 0) {
            if (totalPayloadAccumulated > 0) {
                const currentRatio = weightedPositionSumAccumulated / totalPayloadAccumulated;
                if (currentRatio > maximumRatioFound) {
                    maximumRatioFound = currentRatio;
                    optimalSequenceLabels = pathElements.map(element => element.identification);
                }
            }
            continue;
        }

        for (const nextCandidateIndex of Array.from(availableIndices)) {
            const nextCandidateItem = itemRegistry[nextCandidateIndex];

            if (totalPayloadAccumulated <= nextCandidateItem.limitValue) {
                const newPathElements = [...pathElements, nextCandidateItem];
                const newAvailableIndices = new Set(availableIndices);
                newAvailableIndices.delete(nextCandidateIndex);
                const newTotalPayload = totalPayloadAccumulated + nextCandidateItem.payloadValue;
                const newWeightedSum = weightedPositionSumAccumulated + nextCandidateItem.payloadValue * (newPathElements.length);

                explorationStack.push({
                    pathElements: newPathElements,
                    availableIndices: newAvailableIndices,
                    totalPayloadAccumulated: newTotalPayload,
                    weightedPositionSumAccumulated: newWeightedSum
                });
            }
        }
    }

    return optimalSequenceLabels.reverse().join('\n');
}

let currentLinePointer = 0;
while (currentLinePointer < initialDataLines.length) {
    const itemTotalCount = Number(initialDataLines[currentLinePointer++]);
    if (itemTotalCount === 0) break;

    const currentSegmentLines = [];
    for (let j = 0; j < itemTotalCount; j++) {
        currentSegmentLines.push(initialDataLines[currentLinePointer++]);
    }

    console.log(evaluateCase(currentSegmentLines, itemTotalCount));
}