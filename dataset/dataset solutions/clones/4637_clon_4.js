function interpretInputData(sourceDataLines) {
    const firstDataRow = sourceDataLines[0].split(' ').map(Number);
    const valueCount = firstDataRow[0];
    const desiredGroupSize = firstDataRow[1];
    const valueCollection = sourceDataLines[1].split(' ').map(Number);

    return {
        totalValues: valueCount,
        targetGroupSize: desiredGroupSize,
        initialValuesList: valueCollection
    };
}

function formSubgroups(sourceArray, k) {
    if (k === 0) return [[]];
    if (sourceArray.length < k) return [];

    const currentHead = sourceArray[0];
    const remainingTail = sourceArray.slice(1);

    const withCurrentHead = formSubgroups(remainingTail, k - 1).map(subgroup => [currentHead, ...subgroup]);
    const withoutCurrentHead = formSubgroups(remainingTail, k);

    return [...withCurrentHead, ...withoutCurrentHead];
}

function determineSequenceCost(sequenceFragment, currentPos = 0, totalAdjustments = 0, workingFragment = []) {
    if (currentPos === 0) {
        workingFragment = [...sequenceFragment];
    }
    if (currentPos >= workingFragment.length - 1) {
        return totalAdjustments;
    }

    let requiredIncrement = 0;
    if (workingFragment[currentPos] >= workingFragment[currentPos + 1]) {
        requiredIncrement = workingFragment[currentPos] - workingFragment[currentPos + 1] + 1;
        workingFragment[currentPos + 1] += requiredIncrement;
    }

    return determineSequenceCost(sequenceFragment, currentPos + 1, totalAdjustments + requiredIncrement, workingFragment);
}

function computeOptimalArrangementCost(inputDataLines) {
    const dataDetails = interpretInputData(inputDataLines);
    const { totalValues, targetGroupSize, initialValuesList } = dataDetails;

    if (targetGroupSize === 1) {
        return 0;
    }

    const mandatoryFirstValue = initialValuesList[0];
    const optionalRemainingValues = initialValuesList.slice(1);
    const countForOptionalSelection = targetGroupSize - 1;

    const optionalSubgroups = formSubgroups(optionalRemainingValues, countForOptionalSelection);

    const fullCandidateSequences = optionalSubgroups.map(subgroup => [mandatoryFirstValue, ...subgroup]);

    const allCalculatedCosts = fullCandidateSequences.map(determineSequenceCost);

    const lowestPossibleCost = allCalculatedCosts.reduce((minVal, currentVal) => Math.min(minVal, currentVal), Number.MAX_SAFE_INTEGER);

    return lowestPossibleCost;
}

// Example usage if integrated with the original boilerplate's 'close' event:
// read.on('close', function(){
//   obj = init(inLine); // The original init() is not used by the cloned logic
//   console.error("\n");
//   var start = new Date();
//
//   // This line replaces the original Main();
//   console.log(computeOptimalArrangementCost(inLine));
//
//   var end = new Date() - start;
//   myerr("time : " + (end) + "ms");
//   myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
// });