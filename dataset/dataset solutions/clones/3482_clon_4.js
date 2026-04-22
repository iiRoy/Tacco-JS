const determineGreatestCommonDivisor = (firstVal, secondVal) => {
    while (secondVal !== 0) {
        [firstVal, secondVal] = [secondVal, firstVal % secondVal];
    }
    return firstVal;
};

const processInput = (rawText) => {
    const lines = rawText.trim().split('\n');
    const [dimensionA, dimensionB] = lines[0].split(' ').map(Number);
    const sequenceA = lines[1];
    const sequenceB = lines[2];
    return { dimensionA, dimensionB, sequenceA, sequenceB };
};

const executeLogic = (inputData) => {
    const { dimensionA, dimensionB, sequenceA, sequenceB } = inputData;

    if (sequenceA === sequenceB) {
        console.log(dimensionA);
        return;
    }

    if (dimensionA % dimensionB === 0 || dimensionB % dimensionA === 0) {
        console.log(-1);
        return;
    }

    const commonDiv = determineGreatestCommonDivisor(dimensionA, dimensionB);
    const factorA = dimensionA / commonDiv;
    const factorB = dimensionB / commonDiv;

    const allMatch = Array.from({ length: commonDiv }, (_, currentIdx) => currentIdx)
                          .every(currentIdx =>
                              sequenceA[currentIdx * factorA] === sequenceB[currentIdx * factorB]
                          );

    if (allMatch) {
        console.log((dimensionA * dimensionB) / commonDiv);
    } else {
        console.log(-1);
    }
};

const initiateProcess = () => {
    const fileContent = require('node:fs').readFileSync(0, 'utf8');
    const parsedData = processInput(fileContent);
    executeLogic(parsedData);
};

initiateProcess();