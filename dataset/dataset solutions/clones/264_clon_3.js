const MAX_N_VALUE = 10;
const MAX_SUM_VALUE = 330;
const MAX_DIGIT_VALUE = 9;

let combinationCountsMatrix = Array.from({ length: MAX_N_VALUE + 1 }, () =>
  Array(MAX_SUM_VALUE + 1).fill(0)
);

let digitUsageFlags = Array(MAX_DIGIT_VALUE + 1).fill(false);

function computeCombinations(currentAccumulatedSum, currentRecursionDepth) {
    combinationCountsMatrix[currentRecursionDepth][currentAccumulatedSum]++;

    const nextRecursionDepth = currentRecursionDepth + 1;

    if (nextRecursionDepth > MAX_N_VALUE) {
        return;
    }

    for (let digitCandidate = 0; digitCandidate <= MAX_DIGIT_VALUE; digitCandidate++) {
        if (digitUsageFlags[digitCandidate]) {
            continue;
        }

        digitUsageFlags[digitCandidate] = true;
        const termContribution = digitCandidate * nextRecursionDepth;
        computeCombinations(currentAccumulatedSum + termContribution, nextRecursionDepth);
        digitUsageFlags[digitCandidate] = false;
    }
}

computeCombinations(0, 0);

const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const fileSystemHandler = require('fs');

const rawInputContent = fileSystemHandler.readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');
const inputQueryLines = rawInputContent.trim().split('\n');

for (const singleQueryLine of inputQueryLines) {
    const lineParts = singleQueryLine.split(' ');
    const queryN = Number(lineParts[0]);
    const queryS = Number(lineParts[1]);

    const effectiveNIndex = queryN + 1;
    console.log(combinationCountsMatrix[effectiveNIndex][queryS]);
}
