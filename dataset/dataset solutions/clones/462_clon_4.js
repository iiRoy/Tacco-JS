const xlr = require('readline');

function obtainMappedDigit(octalValue) {
    if (octalValue === 0) return '0';
    if (octalValue === 1) return '1';
    if (octalValue === 2) return '2';
    if (octalValue === 3) return '3';
    if (octalValue === 4) return '5';
    if (octalValue === 5) return '7';
    if (octalValue === 6) return '8';
    if (octalValue === 7) return '9';
    return '';
}

function transformNumericValue(decimalSource) {
    if (decimalSource === 0) {
        return '0';
    }

    let accumulator = '';
    let current = decimalSource;

    while (current > 0) {
        let remainder = current % 8;
        accumulator = obtainMappedDigit(remainder) + accumulator;
        current = Math.floor(current / 8);
    }
    return accumulator;
}

const inputProcessor = xlr.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let allDataChunks = [];

inputProcessor.on('line', (dataUnit) => {
    allDataChunks.push(dataUnit);
});

inputProcessor.on('close', () => {
    let currentPosition = 0;
    while (true) {
        const currentChunk = allDataChunks[currentPosition++];
        if (currentChunk === undefined) {
            break;
        }

        const numericalRepresentation = Number(currentChunk);

        if (numericalRepresentation === 0) {
            break;
        }

        const finalRepresentation = transformNumericValue(numericalRepresentation);
        console.log(finalRepresentation);
    }
});