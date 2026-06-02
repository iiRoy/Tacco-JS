const calculateCircularJumps = (sourceItems, itemQuantity) => {
    return sourceItems.map((currentElement, currentPosition) => {
        for (let stepOffset = 1; stepOffset <= itemQuantity; stepOffset++) {
            if (sourceItems[(currentPosition + stepOffset) % itemQuantity] === currentElement) {
                return stepOffset;
            }
        }
        return itemQuantity;
    });
};

const processSegmentsForUnique = (currentSegment) => {
    if (currentSegment.length === 0) {
        return [];
    }

    const firstSegmentElement = currentSegment[0];
    const remainingSegment = currentSegment.slice(1);
    const nextMatchIndex = remainingSegment.indexOf(firstSegmentElement);

    if (nextMatchIndex === -1) {
        return [firstSegmentElement, ...processSegmentsForUnique(remainingSegment)];
    } else {
        return processSegmentsForUnique(remainingSegment.slice(nextMatchIndex + 1));
    }
};

const processInputData = (rawData) => {
    const lines = rawData.split("\n");
    const firstLineParts = lines[0].split(" ");
    const itemCount = parseInt(firstLineParts[0]);
    const operationLimit = parseInt(firstLineParts[1]);
    const originalItems = lines[1].split(" ");

    const jumpLengths = calculateCircularJumps(originalItems, itemCount);

    let totalProgress = 0;
    let lastValidProgress = 0;
    let iterationCounter = 0;
    const progressHistory = new Map();

    while (totalProgress < itemCount * operationLimit) {
        const currentModIndex = totalProgress % itemCount;

        if (progressHistory.has(currentModIndex)) {
            const previousState = progressHistory.get(currentModIndex);
            const cycleStartIteration = previousState.iteration;
            const cycleStartProgress = previousState.progress;

            const cycleLengthIterations = iterationCounter - cycleStartIteration;
            const cycleLengthProgress = totalProgress - cycleStartProgress;

            if (cycleLengthProgress > 0) {
                const remainingProgressNeeded = (itemCount * operationLimit) - totalProgress;
                const fullCyclesToSkip = Math.floor(remainingProgressNeeded / cycleLengthProgress);

                totalProgress += fullCyclesToSkip * cycleLengthProgress;
                iterationCounter += fullCyclesToSkip * cycleLengthIterations;
            }
            break;
        }

        progressHistory.set(currentModIndex, { iteration: iterationCounter, progress: totalProgress });
        
        lastValidProgress = totalProgress;
        const currentJumpAmount = jumpLengths[currentModIndex] + 1;
        totalProgress += currentJumpAmount;
        iterationCounter++;
    }

    while (totalProgress < itemCount * operationLimit) {
        const currentModIndex = totalProgress % itemCount;
        lastValidProgress = totalProgress;
        const currentJumpAmount = jumpLengths[currentModIndex] + 1;
        totalProgress += currentJumpAmount;
    }

    const finalStartIdx = lastValidProgress % itemCount;
    const remainingElements = originalItems.slice(finalStartIdx);

    const finalOutput = processSegmentsForUnique(remainingElements);

    console.log(finalOutput.join(" "));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
