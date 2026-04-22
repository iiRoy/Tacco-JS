function processSequence(rawInput) {
    const inputLines = rawInput.split("\n");
    const firstLineData = inputLines[0].split(" ").map(Number);
    const elementCount = firstLineData[0];
    const repeatFactor = firstLineData[1];
    const initialElements = inputLines[1].split(" ");

    const doubledElements = initialElements.concat(initialElements);
    const jumpOffsets = new Array(elementCount);

    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        const nextOccurrenceIndex = doubledElements.indexOf(initialElements[currentIdx], currentIdx + 1);
        jumpOffsets[currentIdx] = (nextOccurrenceIndex - currentIdx) + 1;
    }

    const totalTargetSkips = elementCount * repeatFactor;

    let currentPosition = 0; 
    let cumulativeSkips = 0; 
    
    const visitHistory = new Map(); 
    const pathTrace = []; 

    let stepNumber = 0;
    while (!visitHistory.has(currentPosition)) {
        visitHistory.set(currentPosition, { stepNumber: stepNumber, cumulativeSkipAmount: cumulativeSkips });
        pathTrace.push({ index_in_N: currentPosition, cumulativeSkipAmount: cumulativeSkips });

        const currentJump = jumpOffsets[currentPosition];
        cumulativeSkips += currentJump;
        currentPosition = cumulativeSkips % elementCount;
        stepNumber++;
    }

    const cycleEntryInfo = visitHistory.get(currentPosition);
    const cycleEntryStep = cycleEntryInfo.stepNumber;
    const cycleEntryCumulativeSkips = cycleEntryInfo.cumulativeSkipAmount;

    const cycleLengthSteps = stepNumber - cycleEntryStep;
    const cycleSkipAmountTotal = cumulativeSkips - cycleEntryCumulativeSkips;

    let finalStartPointer;

    if (totalTargetSkips < cycleEntryCumulativeSkips) {
        const relevantState = pathTrace.find(state => 
            state.cumulativeSkipAmount <= totalTargetSkips && 
            (state.stepNumber + 1 < pathTrace.length ? pathTrace[state.stepNumber + 1].cumulativeSkipAmount > totalTargetSkips : true)
        );
        finalStartPointer = relevantState.index_in_N;
    } else {
        const remainingSkipsInTarget = totalTargetSkips - cycleEntryCumulativeSkips;
        const skipsIntoCycleAfterRepeats = remainingSkipsInTarget % cycleSkipAmountTotal;
        const targetCumulativeSkipsInPath = cycleEntryCumulativeSkips + skipsIntoCycleAfterRepeats;

        const relevantState = pathTrace.find(state => 
            state.cumulativeSkipAmount <= targetCumulativeSkipsInPath && 
            (state.stepNumber + 1 < pathTrace.length ? pathTrace[state.stepNumber + 1].cumulativeSkipAmount > targetCumulativeSkipsInPath : true)
        );
        finalStartPointer = relevantState.index_in_N;
    }

    const circularView = initialElements.slice(finalStartPointer).concat(initialElements.slice(0, finalStartPointer));

    function filterAndJump(workingList, currentListIndex, finalResultAccumulator) {
        if (currentListIndex >= workingList.length) {
            return finalResultAccumulator;
        }

        const currentItem = workingList[currentListIndex];
        const nextDuplicateRelativeIndex = workingList.slice(currentListIndex + 1).indexOf(currentItem);

        if (nextDuplicateRelativeIndex === -1) {
            finalResultAccumulator.push(currentItem);
            return filterAndJump(workingList, currentListIndex + 1, finalResultAccumulator);
        } else {
            return filterAndJump(workingList, currentListIndex + 1 + nextDuplicateRelativeIndex + 1, finalResultAccumulator);
        }
    }
    
    const finalOutputItems = filterAndJump(circularView, 0, []);
    
    console.log(finalOutputItems.join(" "));
}
processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));