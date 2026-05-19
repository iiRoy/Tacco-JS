const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines = [];
rl.on('line', (line) => {
    inputLines.push(line);
});

rl.on('close', () => {
    processSolution();
});

const MODULO_VALUE = 998244353n;

function calculateModularPower(base, exponent, modulus) {
    let resultAccumulator = 1n;
    let currentBase = base % modulus;
    let currentExponent = exponent;

    while (currentExponent > 0n) {
        if (currentExponent % 2n === 1n) {
            resultAccumulator = (resultAccumulator * currentBase) % modulus;
        }
        currentBase = (currentBase * currentBase) % modulus;
        currentExponent /= 2n;
    }
    return resultAccumulator;
}

function processSolution() {
    let lineCursor = 0;
    const getNextLine = () => inputLines[lineCursor++];
    const parseInteger = () => parseInt(getNextLine(), 10);
    const parseIntegerArray = () => getNextLine().split(' ').map(Number);

    const dataSize = parseInteger();
    const dataElements = parseIntegerArray();

    const frequencyCounts = new Array(dataSize).fill(0);

    for (let elementIndex = 0; elementIndex < dataSize; elementIndex++) {
        const currentElementValue = dataElements[elementIndex];
        if (currentElementValue >= 0 && currentElementValue < dataSize) {
            frequencyCounts[currentElementValue]++;
        }
    }

    const firstElement = dataElements[0];
    const countOfZeroValue = frequencyCounts[0];

    if (firstElement !== 0 || countOfZeroValue >= 2) {
        console.log(0);
        return;
    }

    let finalResultProduct = 1n;

    for (let iterationIndex = 2; iterationIndex < dataSize; iterationIndex++) {
        const baseForPower = BigInt(frequencyCounts[iterationIndex - 1]);
        const exponentForPower = BigInt(frequencyCounts[iterationIndex]);

        const currentTermPower = calculateModularPower(baseForPower, exponentForPower, MODULO_VALUE);

        finalResultProduct = (finalResultProduct * currentTermPower) % MODULO_VALUE;
    }

    console.log(finalResultProduct.toString());
}
