const evaluateDivisor = (firstOperand, secondOperand) => (
    secondOperand === 0
        ? firstOperand
        : evaluateDivisor(secondOperand, firstOperand % secondOperand)
);

const calculateMultiple = (valueA, valueB) => (
    (valueA * valueB) / evaluateDivisor(valueA, valueB)
);

const processDataSegments = (allSourceLines, currentLinePosition = 0) => {
    const segmentCount = Number(allSourceLines[currentLinePosition]);
    if (segmentCount === 0) {
        return;
    }

    let nextReadPosition = currentLinePosition + 1;
    const currentSegmentLines = allSourceLines.slice(nextReadPosition, nextReadPosition + segmentCount);
    nextReadPosition += segmentCount;

    const initialComponents = currentSegmentLines.map(lineText =>
        lineText.split(' ').map(Number)
    );

    const simplifiedComponents = initialComponents.map(pair => {
        const commonFactor = evaluateDivisor(pair[0], pair[1]);
        return [pair[0] / commonFactor, pair[1] / commonFactor];
    });

    const denominatorElements = simplifiedComponents.map(item => item[1]);
    const finalDenominatorLCM = denominatorElements.reduce(calculateMultiple, 1);

    const adjustedNumeratorElements = simplifiedComponents.map(item =>
        item[0] * (finalDenominatorLCM / item[1])
    );

    const finalNumeratorLCM = adjustedNumeratorElements.reduce(calculateMultiple, 1);

    const resultingOutputs = adjustedNumeratorElements.map(numeratorValue =>
        finalNumeratorLCM / numeratorValue
    );
    console.log(resultingOutputs.join('\n'));

    processDataSegments(allSourceLines, nextReadPosition);
};

const inputPayload = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedInputLines = inputPayload.trim().split('\n');

processDataSegments(parsedInputLines);