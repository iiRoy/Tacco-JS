const dataInputSource = process.platform === 'win32' ? 'tmp' : '/dev/stdin';
const lineSeparationMark = process.platform === 'win32' ? '\r\n' : '\n';

const obtainRawData = (sourcePath) => require('fs').readFileSync(sourcePath, 'utf8');

const processDataSegments = (rawDataContent, separator) => {
    return rawDataContent
        .replace(/^\s+|\s+$/g, '')
        .split(separator);
};

function determineCommonFactor(valueX, valueY) {
    const numericX = Number(valueX);
    const numericY = Number(valueY);

    if (numericY === 0) {
        return numericX;
    }
    return determineCommonFactor(numericY, numericX % numericY);
}

function calculateLeastCommonMultiple(figureP, figureQ) {
    const numP = Number(figureP);
    const numQ = Number(figureQ);

    if (numP === 0 || numQ === 0) {
        return 0;
    }

    const commonDivisor = determineCommonFactor(numP, numQ);
    return (numP / commonDivisor) * numQ;
}

const fullContent = obtainRawData(dataInputSource);
const contentLines = processDataSegments(fullContent, lineSeparationMark);

for (const entryRow of contentLines) {
    const numberTokens = entryRow.split(' ');
    const firstOperand = numberTokens[0];
    const secondOperand = numberTokens[1];

    const resultGCD = determineCommonFactor(firstOperand, secondOperand);
    const resultLCM = calculateLeastCommonMultiple(firstOperand, secondOperand);

    console.log(`${resultGCD} ${resultLCM}`);
}