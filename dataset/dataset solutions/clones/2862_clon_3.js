const MODULO_VALUE = 1000000007;

const parseInteger = (str) => parseInt(str, 10);

function calculateWaysForGap(gapSize) {
    if (isNaN(gapSize)) {
        return undefined;
    }
    if (gapSize < 0) {
        return 0;
    }
    if (gapSize === 0 || gapSize === 1) {
        return 1;
    }
    if (gapSize === 2) {
        return 2;
    }

    const fibValues = [1, 2];
    for (let k = 2; k < gapSize; k++) {
        const nextFib = (fibValues[k - 1] + fibValues[k - 2]) % MODULO_VALUE;
        fibValues.push(nextFib);
    }
    return fibValues[gapSize - 1];
}

function processInput(rawData) {
    const trimmedInput = rawData.trim();
    const inputLines = trimmedInput.split('\n');

    const firstLineParts = inputLines[0].split(' ');
    const totalSteps = parseInteger(firstLineParts[0]);
    const forbiddenStepCount = parseInteger(firstLineParts[1]);

    const forbiddenPositions = [];
    for (let idx = 1; idx <= forbiddenStepCount; idx++) {
        forbiddenPositions.push(parseInteger(inputLines[idx]));
    }

    let adjacentForbiddenCount = 0;
    for (let idx = 0; idx < forbiddenPositions.length - 1; idx++) {
        if (forbiddenPositions[idx + 1] - forbiddenPositions[idx] === 1) {
            adjacentForbiddenCount++;
        }
    }

    if (adjacentForbiddenCount > 0) {
        console.log(0);
        return;
    }

    const gapLengths = [];
    gapLengths.push(forbiddenPositions[0] - 1); 

    for (let idx = 1; idx < forbiddenStepCount; idx++) {
        gapLengths.push(forbiddenPositions[idx] - forbiddenPositions[idx - 1] - 2);
    }

    gapLengths.push(totalSteps - forbiddenPositions[forbiddenStepCount - 1] - 1);

    const waysPerGap = gapLengths.map(gap => calculateWaysForGap(gap));

    let overallResult = 1;
    for (const ways of waysPerGap) {
        overallResult = (overallResult * ways) % MODULO_VALUE;
    }

    console.log(overallResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
