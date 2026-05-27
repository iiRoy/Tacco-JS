process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedData = '';
process.stdin.on('data', (chunk) => {
    receivedData += chunk;
});

process.stdin.on('end', () => {
    processInputLines(receivedData.split(/\r?\n/));
});

function processInputLines(inputLines) {
    const elementCount = Number(inputLines[0]);
    const numericElements = inputLines[1].split(' ').map(Number);

    const finalResult = computeFinalValue(numericElements);
    console.log(finalResult);
}

function computeFinalValue(dataElements) {
    const dataLength = dataElements.length;

    const finalAccumulation = dataElements.reduceRight((currentAccumulatedResult, currentElementValue, currentElementIndex) => {
        const remainingCountForPower = dataLength - (currentElementIndex + 1);
        const powerTerm = Math.pow(3, remainingCountForPower);

        if (currentElementValue % 2 === 0) {
            return powerTerm + 2 * currentAccumulatedResult;
        } else {
            return 2 * powerTerm + currentAccumulatedResult;
        }
    }, 0);

    return finalAccumulation;
}
