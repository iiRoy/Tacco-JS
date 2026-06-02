const fileSystemUtility = require('fs');

const rawContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawContent.split("\n");

function processAndConditionallyPrepareForOutput(segment) {
    const currentParsedValue = Number(segment);

    const comparisonString = '0 0';
    const isValueNotZeroZeroString = (currentParsedValue !== comparisonString);

    if (isValueNotZeroZeroString) {
        const outputCandidate = currentParsedValue;
        return outputCandidate;
    }
    return currentParsedValue;
}

const valuesToPrint = lineSegments.map(processAndConditionallyPrepareForOutput);

function emitToConsole(data) {
    console.log(data);
}

valuesToPrint.forEach(item => {
    emitToConsole(item);
});
