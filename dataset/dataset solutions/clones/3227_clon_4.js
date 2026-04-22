const fileSystem = require('fs');

const calculateResult = () => {
    const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const lines = rawData.split('\n');

    const [desiredRemovalsStr, elementCountStr] = lines[0].split(' ');
    const desiredRemovals = Number(desiredRemovalsStr);
    const elementCount = Number(elementCountStr);

    const numericalData = lines[1].split(' ').map(str => Number(str));

    if (desiredRemovals >= elementCount) {
        return 0;
    }

    const orderedValues = [...numericalData].sort((valA, valB) => valA - valB);

    const adjacentSpans = orderedValues.slice(1).map((currentVal, index) => currentVal - orderedValues[index]);

    const sortedSpans = [...adjacentSpans].sort((spanA, spanB) => spanA - spanB);

    const numberOfSpansToKeep = elementCount - desiredRemovals;

    const cumulativeSpan = sortedSpans
        .slice(0, numberOfSpansToKeep)
        .reduce((totalAccum, currentSpan) => totalAccum + currentSpan, 0);

    return cumulativeSpan;
};

const outputFinalValue = () => {
    console.log(calculateResult());
};

outputFinalValue();