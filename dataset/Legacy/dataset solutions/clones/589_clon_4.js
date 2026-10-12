const fs = require('fs');
const inputFilePath = '/dev/stdin';

const rawInputData = fs.readFileSync(inputFilePath, 'utf8');
const processedInputLines = rawInputData.trim().split('\n');

function* numericValueStream(sourceLines) {
    let currentPosition = 0;
    while (currentPosition < sourceLines.length) {
        yield Number(sourceLines[currentPosition++]);
    }
}

const dataPointProvider = numericValueStream(processedInputLines);

function* structuredProblemGenerator(valueSource) {
    let mainControlValue;
    while (true) {
        const nextDataPoint = valueSource.next();
        mainControlValue = nextDataPoint.value;

        if (nextDataPoint.done || mainControlValue === 0) {
            break;
        }

        const tenComponentValues = [];
        for (let counter = 0; counter < 10; counter++) {
            const componentDataPoint = valueSource.next();
            if (componentDataPoint.done) {
                throw new Error("Insufficient input for a complete problem set.");
            }
            tenComponentValues.push(componentDataPoint.value);
        }
        yield { primaryTerm: mainControlValue, secondaryTerms: tenComponentValues };
    }
}

const problemSetIterator = structuredProblemGenerator(dataPointProvider);

for (const currentProblemSet of problemSetIterator) {
    const primaryOperand = currentProblemSet.primaryTerm;
    const sumOfSecondaryOperands = currentProblemSet.secondaryTerms.reduce((accumulator, currentNumber) => accumulator + currentNumber, 0);
    console.log(primaryOperand - sumOfSecondaryOperands);
}
