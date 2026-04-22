const transformRawDataToIntegers = (sourcePayload) => {
    let currentLineSegment = '';
    const processedIntegerList = [];
    const payloadCharacterCount = sourcePayload.length;

    for (let index = 0; index < payloadCharacterCount; index++) {
        const charAtCurrentIndex = sourcePayload[index];
        if (charAtCurrentIndex === '\n') {
            if (currentLineSegment.length > 0) {
                processedIntegerList.push(parseInt(currentLineSegment, 10));
            }
            currentLineSegment = '';
        } else {
            currentLineSegment += charAtCurrentIndex;
        }
    }
    if (currentLineSegment.length > 0) {
        processedIntegerList.push(parseInt(currentLineSegment, 10));
    }
    return processedIntegerList;
};

const calculateSuperiorValue = (firstTerm, secondTerm) => {
    return (firstTerm + secondTerm + Math.abs(firstTerm - secondTerm)) / 2;
};

const calculateRequiredUnits = (dividend, potentialDivisorA, potentialDivisorB) => {
    const effectiveDivisor = calculateSuperiorValue(potentialDivisorA, potentialDivisorB);
    return Math.ceil(dividend / effectiveDivisor);
};

(function initiateProcessingSequence() {
    const rawDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    const integerComponents = transformRawDataToIntegers(rawDataContent);

    const dimension_X = integerComponents[0];
    const dimension_Y = integerComponents[1];
    const item_Count = integerComponents[2];

    const finalComputedResult = calculateRequiredUnits(item_Count, dimension_X, dimension_Y);

    console.log(finalComputedResult);
})();