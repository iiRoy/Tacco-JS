const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const transformInput = (rawText) =>
    rawText
        .split('\n')
        .map(lineContent => parseInt(lineContent.trim(), 10))
        .filter(processedNumber => !isNaN(processedNumber) && processedNumber !== 0);

const numericInputs = transformInput(sourceData);

function* sumPossibilities(targetQuantity) {
    const componentALimit = 100;
    const componentBLimit = 1000;

    for (let currentA = 0; currentA <= componentALimit; currentA++) {
        const cubicA = currentA ** 3;
        for (let currentB = 0; currentB <= componentBLimit; currentB++) {
            const squareB = currentB ** 2;
            const componentC = targetQuantity - cubicA + squareB;

            if (componentC < 0) {
                break;
            }
            yield currentA + currentB + componentC;
        }
    }
}

numericInputs.forEach(specificValue => {
    let minimumAttained = Number.POSITIVE_INFINITY;
    for (const potentialSum of sumPossibilities(specificValue)) {
        if (potentialSum < minimumAttained) {
            minimumAttained = potentialSum;
        }
    }
    console.log(minimumAttained);
});