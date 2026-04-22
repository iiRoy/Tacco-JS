const processRawInput = (dataString) => {
    const contentLines = dataString.split(/\r?\n/).filter(Boolean).map(str => str.trim());
    const numericalArrays = contentLines.map(lineStr =>
        lineStr.split(/\s+/).filter(Boolean).map(Number)
    );

    const [configRow, firstCollection, secondCollection, thirdCollection] = numericalArrays;

    const [
        valX,
        valY,
        valA,
        valB,
        valC
    ] = configRow;

    return {
        initialX: valX,
        initialY: valY,
        maximumPIndex: valA - 1,
        maximumQIndex: valB - 1,
        maximumRIndex: valC - 1,
        dataP: firstCollection,
        dataQ: secondCollection,
        dataR: thirdCollection
    };
};

const computeMaximizedSum = (processedData) => {
    const {
        initialX,
        initialY,
        maximumPIndex,
        maximumQIndex,
        maximumRIndex,
        dataP,
        dataQ,
        dataR
    } = processedData;

    const orderedP = [...dataP].sort((item1, item2) => item1 - item2);
    const orderedQ = [...dataQ].sort((item1, item2) => item1 - item2);
    const orderedR = [...dataR].sort((item1, item2) => item1 - item2);

    const selectedFromP = orderedP.slice(Math.max(0, maximumPIndex - initialX + 1), maximumPIndex + 1);
    const selectedFromQ = orderedQ.slice(Math.max(0, maximumQIndex - initialY + 1), maximumQIndex + 1);

    const allCandidateValues = [...selectedFromP, ...selectedFromQ, ...orderedR];

    const totalElementsToPick = initialX + initialY;

    const finalSelectionSet = allCandidateValues
        .sort((item1, item2) => item1 - item2)
        .slice(-totalElementsToPick);

    const accumulatedResult = finalSelectionSet.reduce((currentSum, value) => currentSum + value, 0);

    return accumulatedResult;
};

const entryPointForApplication = (rawInputData) => {
    const parsedDataStructure = processRawInput(rawInputData);
    const finalComputedSum = computeMaximizedSum(parsedDataStructure);
    console.log(finalComputedSum);
};

entryPointForApplication(require('fs').readFileSync('/dev/stdin', 'utf8'));