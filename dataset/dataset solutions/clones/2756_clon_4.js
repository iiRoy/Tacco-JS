function executeCalculation(rawData) {
    const segmentLines = rawData.split('\n').filter(Boolean);
    const initialItemCount = Number.parseInt(segmentLines[0], 10);
    let itemSequence = segmentLines[1].split(' ').map(Number);

    function evaluateCombinationProcess(currentSequence) {
        if (currentSequence.length === 2) {
            return currentSequence[0] + currentSequence[1];
        }

        const selectedIndex = pinpointMergeTarget(currentSequence);
        const transformedSequence = applyMergeOperation(currentSequence, selectedIndex);
        
        return evaluateCombinationProcess(transformedSequence);
    }

    function pinpointMergeTarget(sourceCollection) {
        let optimalSpot = -1;
        for (let currentPosition = 1; currentPosition < sourceCollection.length - 1; ++currentPosition) {
            if (optimalSpot === -1 || sourceCollection[optimalSpot] > sourceCollection[currentPosition]) {
                optimalSpot = currentPosition;
            } else if (sourceCollection[optimalSpot] === sourceCollection[currentPosition]) {
                const currentAdjacentSum = sourceCollection[currentPosition - 1] + sourceCollection[currentPosition + 1];
                const optimalAdjacentSum = sourceCollection[optimalSpot - 1] + sourceCollection[optimalSpot + 1];
                if (currentAdjacentSum < optimalAdjacentSum) {
                    optimalSpot = currentPosition;
                }
            }
        }

        const valueAtOptimalSpot = sourceCollection[optimalSpot];
        const secondEntryValue = sourceCollection[1];
        const penultimateEntryValue = sourceCollection[sourceCollection.length - 2];

        if (valueAtOptimalSpot * 2 > secondEntryValue) {
            optimalSpot = 1;
            if (sourceCollection[optimalSpot] > penultimateEntryValue) {
                optimalSpot = sourceCollection.length - 2;
            }
        } else if (valueAtOptimalSpot * 2 > penultimateEntryValue) {
            optimalSpot = sourceCollection.length - 2;
        }
        return optimalSpot;
    }

    function applyMergeOperation(originalList, mergeIndex) {
        const mergeElementValue = originalList[mergeIndex];

        return originalList.flatMap((element, index) => {
            if (index === mergeIndex - 1) {
                return [element + mergeElementValue];
            } else if (index === mergeIndex) {
                return [];
            } else if (index === mergeIndex + 1) {
                return [element + mergeElementValue];
            } else {
                return [element];
            }
        });
    }

    const finalResult = evaluateCombinationProcess(itemSequence);
    console.log(finalResult);
}

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));