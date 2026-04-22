const systemInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const collectedInputs = [];

systemInterface.on('line', (currentLine) => {
    if (currentLine.trim() !== '') {
        collectedInputs.push(currentLine);
    }
});

systemInterface.on('close', () => {
    initiateComputation(collectedInputs);
});

const emitOutcome = (resultValue) => {
    console.log(resultValue);
};

const calculateHypotenuse = (sideOne, sideTwo) => {
    return Math.sqrt((sideOne * sideOne) + (sideTwo * sideTwo));
};

const calculateAbsoluteDifference = (valOne, valTwo) => {
    return (valOne > valTwo) ? (valOne - valTwo) : (valTwo - valOne);
};

const findOptimalDeviation = (currentIdx, upperLimit, primaryVal, secondaryVal, currentMinimal) => {
    if (currentIdx > upperLimit) {
        return currentMinimal;
    }

    const legA = currentIdx;
    const legB = primaryVal - currentIdx;
    const hypotenuseValue = calculateHypotenuse(legA, legB);
    const deviation = calculateAbsoluteDifference(secondaryVal, hypotenuseValue);

    const nextMinimal = (currentMinimal === null || deviation < currentMinimal) ? deviation : currentMinimal;

    return findOptimalDeviation(currentIdx + 1, upperLimit, primaryVal, secondaryVal, nextMinimal);
};

const initiateComputation = (inputSource) => {
    let currentInputIndex = 0;
    while (currentInputIndex < inputSource.length) {
        const currentDataLine = inputSource[currentInputIndex++];
        const parsedValues = currentDataLine.split(' ').map(valStr => parseFloat(valStr));

        const primaryValue = parsedValues[0];
        const secondaryValue = parsedValues[1];

        if (primaryValue === 0) {
            break;
        }

        const iterationCeiling = Math.floor(primaryValue / 2);

        const computedOutcome = findOptimalDeviation(0, iterationCeiling, primaryValue, secondaryValue, null);
        emitOutcome(computedOutcome);
    }
};