const dataProcessor = require('readline');
const systemOutput = require('process').stdout;
const systemInput = require('process').stdin;

const valueRegistry = new Map();

function obtainSequenceElement(position) {
    if (valueRegistry.has(position)) {
        return valueRegistry.get(position);
    }

    let calculatedValue;
    if (position === 0) {
        calculatedValue = 1;
    } else if (position === 1) {
        calculatedValue = 1;
    } else if (position === 2) {
        calculatedValue = 2;
    } else {
        calculatedValue = obtainSequenceElement(position - 1) +
                          obtainSequenceElement(position - 2) +
                          obtainSequenceElement(position - 3);
    }

    valueRegistry.set(position, calculatedValue);
    return calculatedValue;
}

for (let currentPosition = 0; currentPosition <= 30; ++currentPosition) {
    obtainSequenceElement(currentPosition);
}

const inputGatherer = [];
const interactiveInterface = dataProcessor.createInterface({
    input: systemInput,
    output: systemOutput,
    terminal: false
});

interactiveInterface.on('line', (lineContent) => {
    if (lineContent.trim() !== '') {
        const numericValue = Number.parseInt(lineContent, 10);
        inputGatherer.push(numericValue);
    }
});

interactiveInterface.on('close', () => {
    const adjustmentValue = 3649;
    const divisionFactor = 3650;

    for (const requestedIndex of inputGatherer) {
        const correspondingSequenceValue = valueRegistry.get(requestedIndex);
        const intermediateResult = (correspondingSequenceValue + adjustmentValue) / divisionFactor;
        const finalResult = Math.floor(intermediateResult);
        systemOutput.write(finalResult.toString() + '\n');
    }
});