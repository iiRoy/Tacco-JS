const MAX_DIGIT_VALUE = 9;
const MIN_DIGIT_VALUE = 0;
const MAX_POSITIONS_TO_FILL = 10;
const MAX_POSSIBLE_SUM = 330;

const DP_TABLE_ROWS = MAX_POSITIONS_TO_FILL + 1;
const DP_TABLE_COLS = MAX_POSSIBLE_SUM + 1;
const MASK_SIZE = 1 << (MAX_DIGIT_VALUE + 1);

const waysToFormSum = Array(DP_TABLE_ROWS).fill(null).map(() =>
    Array(DP_TABLE_COLS).fill(null).map(() =>
        Array(MASK_SIZE).fill(0)
    )
);

waysToFormSum[0][0][0] = 1;

for (let currentDigitsChosen = 0; currentDigitsChosen < MAX_POSITIONS_TO_FILL; currentDigitsChosen++) {
    const currentPositionMultiplier = currentDigitsChosen + 1;

    for (let currentAccumulatedSum = 0; currentAccumulatedSum <= MAX_POSSIBLE_SUM; currentAccumulatedSum++) {
        for (let currentUsedMask = 0; currentUsedMask < MASK_SIZE; currentUsedMask++) {
            if (waysToFormSum[currentDigitsChosen][currentAccumulatedSum][currentUsedMask] === 0) {
                continue;
            }

            for (let digitCandidate = MIN_DIGIT_VALUE; digitCandidate <= MAX_DIGIT_VALUE; digitCandidate++) {
                if (!((currentUsedMask >> digitCandidate) & 1)) {
                    const nextAccumulatedSum = currentAccumulatedSum + digitCandidate * currentPositionMultiplier;
                    const nextUsedMask = currentUsedMask | (1 << digitCandidate);

                    if (nextAccumulatedSum <= MAX_POSSIBLE_SUM) {
                        waysToFormSum[currentDigitsChosen + 1][nextAccumulatedSum][nextUsedMask] +=
                            waysToFormSum[currentDigitsChosen][currentAccumulatedSum][currentUsedMask];
                    }
                }
            }
        }
    }
}

const finalCountsTable = Array(DP_TABLE_ROWS).fill(null).map(() =>
    Array(DP_TABLE_COLS).fill(0)
);

for (let k = 0; k <= MAX_POSITIONS_TO_FILL; k++) {
    for (let s = 0; s <= MAX_POSSIBLE_SUM; s++) {
        for (let m = 0; m < MASK_SIZE; m++) {
            finalCountsTable[k][s] += waysToFormSum[k][s][m];
        }
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

inputLines.forEach(function(lineContent) {
    const parsedNumbers = lineContent.split(" ").map(Number);
    const numDigitsQuery = parsedNumbers[0];
    const targetSumQuery = parsedNumbers[1];
    console.log(finalCountsTable[numDigitsQuery + 1][targetSumQuery]);
});
