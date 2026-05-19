function generatePrimesUpTo(upperBound) {
    const isComposite = new Uint8Array(upperBound + 1);
    const primeCollection = new Set();

    if (upperBound >= 0) isComposite[0] = 1;
    if (upperBound >= 1) isComposite[1] = 1;

    for (let currentNum = 2; currentNum <= upperBound; ++currentNum) {
        if (isComposite[currentNum] === 0) {
            primeCollection.add(currentNum);
            for (let multiple = currentNum * currentNum; multiple <= upperBound; multiple += currentNum) {
                isComposite[multiple] = 1;
            }
        }
    }
    return primeCollection;
}

const primeSetCache = generatePrimesUpTo(1000000);

input = '4 15000\n305\n260\n129\n500\n3 400\n10\n20\n30\n3 200909\n5\n9\n12\n0 0\n';
const lineSegments = (input.trim()).split("\n");
let lineIndex = 0;

while (true) {
    const currentLineParts = lineSegments[lineIndex++].split(" ");
    const nVal = Number(currentLineParts[0]);
    const xVal = Number(currentLineParts[1]);

    if (nVal === 0 && xVal === 0) break;

    const inputNumbers = [];
    for (let i = 0; i < nVal; ++i) {
        const currentNum = Number(lineSegments[lineIndex++]);
        inputNumbers.push(currentNum);
    }

    let currentReachableSums = new Set([0]);

    for (const itemValue of inputNumbers) {
        const sumsToAddInThisIteration = new Set();
        for (const existingSum of currentReachableSums) {
            const potentialNewSum = existingSum + itemValue;
            if (potentialNewSum <= 1000000) {
                sumsToAddInThisIteration.add(potentialNewSum);
            }
        }
        for (const sumToAdd of sumsToAddInThisIteration) {
            currentReachableSums.add(sumToAdd);
        }
    }

    let foundPrimeSum = 0;
    for (let k = xVal; k > 0; --k) {
        if (currentReachableSums.has(k) && primeSetCache.has(k)) {
            foundPrimeSum = k;
            break;
        }
    }
    console.log((foundPrimeSum === 0) ? "NA" : foundPrimeSum);
}
