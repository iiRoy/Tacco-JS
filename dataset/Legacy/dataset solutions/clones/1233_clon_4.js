const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const sourceLines = fileContent.split('\n');

let processingActive = true;

const processedResults = sourceLines.reduce((accumulator, currentLine) => {
    if (!processingActive) {
        return accumulator;
    }

    const numericValues = currentLine.split(' ').map(Number);
    const [firstVal, secondVal] = numericValues;

    if (firstVal === 0 && secondVal === 0) {
        processingActive = false;
        return accumulator;
    }

    const orderedValues = [...numericValues].sort((valA, valB) => valA - valB);
    accumulator.push(orderedValues.join(' '));
    return accumulator;
}, []);

processedResults.forEach(outputLine => console.log(outputLine));
