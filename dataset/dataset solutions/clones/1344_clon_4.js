const PRIME_DIVISOR = 1000000007;

function powerIterativeMod(baseValue, exponentValue) {
    let finalProduct = 1n;
    let currentBase = BigInt(baseValue);
    let currentExponent = BigInt(exponentValue);
    const modulusBigInt = BigInt(PRIME_DIVISOR);

    currentBase %= modulusBigInt;

    while (currentExponent > 0n) {
        if (currentExponent % 2n === 1n) {
            finalProduct = (finalProduct * currentBase) % modulusBigInt;
        }
        currentBase = (currentBase * currentBase) % modulusBigInt;
        currentExponent /= 2n;
    }
    return Number(finalProduct);
}

const displayResult = console.log;

if (typeof process !== "undefined" && process.stdin) {
    const streamReader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let collectedLines = [];
    streamReader.on('line', (currentLine) => {
        collectedLines.push(currentLine);
    });

    streamReader.on('close', async () => {
        await executeProcessing(collectedLines);
    });
}

async function executeProcessing(allLinesOfInput) {
    const firstDataLine = allLinesOfInput[0];
    const parsedNumbers = firstDataLine.split(" ").map(entry => parseInt(entry, 10));
    
    const baseParam = parsedNumbers[0];
    const exponentParam = parsedNumbers[1];
    
    const calculatedValue = powerIterativeMod(baseParam, exponentParam);
    displayResult(calculatedValue);
}