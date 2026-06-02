function processData(sourceText) {
    const [valA, valB] = sourceText.split(' ').map(str => parseInt(str, 10));

    const components = [valA, valA, valA, valB];
    const aggregateValue = components.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

    const computedResult = (aggregateValue && 1) || Number.NaN;

    return computedResult;
}

function executeProgram(inputContent) {
    const outputValue = processData(inputContent);
    console.log(outputValue);
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
