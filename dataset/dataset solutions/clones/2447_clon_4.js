function bigIntExponentiateMod(baseValue, powerValue, moduloValue) {
    let bigBase = BigInt(baseValue);
    let bigModulo = BigInt(moduloValue);
    let bigPower = BigInt(powerValue);

    if (bigPower === 0n) {
        return 1;
    }
    if (bigBase === 0n) {
        return 0;
    }

    let bigComputationResult = 1n;
    let bigCurrentBaseTerm = bigBase % bigModulo;

    while (bigPower > 0n) {
        if (bigPower % 2n === 1n) {
            bigComputationResult = (bigComputationResult * bigCurrentBaseTerm) % bigModulo;
        }
        bigCurrentBaseTerm = (bigCurrentBaseTerm * bigCurrentBaseTerm) % bigModulo;
        bigPower = bigPower / 2n;
    }
    return Number(bigComputationResult);
}

function solveProblem() {
    const inputLines = [];
    const readStream = process.stdin;
    const writeStream = process.stdout;

    readStream.on('data', chunk => {
        inputLines.push(...chunk.toString().trim().split('\n'));
    });

    readStream.on('end', () => {
        const inputSize = parseInt(inputLines[0], 10);
        const dataElements = inputLines[1].split(' ').map(Number);

        if (isNaN(inputSize) || inputSize <= 0 || dataElements.length !== inputSize) {
            writeStream.write('0\n');
            return;
        }

        const tallyMap = new Map();
        for (const dataPoint of dataElements) {
            tallyMap.set(dataPoint, (tallyMap.get(dataPoint) || 0) + 1);
        }

        const initialDatum = dataElements[0];
        const zeroOccurrences = tallyMap.get(0) || 0;

        if (initialDatum !== 0 || zeroOccurrences >= 2) {
            writeStream.write('0\n');
            return;
        }

        const MODULO_CONSTANT = 998244353;
        
        const factorIndices = Array.from({ length: Math.max(0, inputSize - 2) }, (_, index) => index + 2);

        const cumulativeProduct = factorIndices.reduce((currentValue, processingIndex) => {
            const priorCount = tallyMap.get(processingIndex - 1) || 0;
            const currentCount = tallyMap.get(processingIndex) || 0;

            const powerTerm = bigIntExponentiateMod(priorCount, currentCount, MODULO_CONSTANT);

            return (currentValue * BigInt(powerTerm)) % BigInt(MODULO_CONSTANT);
        }, 1n);

        writeStream.write(cumulativeProduct.toString() + '\n');
    });
}

solveProblem();