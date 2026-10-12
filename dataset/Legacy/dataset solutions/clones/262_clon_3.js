const MAX_DP_ROWS = 11;
const MAX_DP_COLS = 331;
const MAX_DIGIT_INDEX = 9;
const RECURSION_TERMINATION_COUNT = 11;

const combinationCounts = Array.from({ length: MAX_DP_ROWS }, () => Array(MAX_DP_COLS).fill(0));

const digitAvailability = Array(MAX_DIGIT_INDEX + 1).fill(false);

function exploreDigitCombinations(currentAccumulatedSum, currentDigitCount) {
    combinationCounts[currentDigitCount][currentAccumulatedSum]++;

    const nextDigitCount = currentDigitCount + 1;

    if (nextDigitCount === RECURSION_TERMINATION_COUNT) {
        return;
    }

    for (let digitValue = 0; digitValue <= MAX_DIGIT_INDEX; digitValue++) {
        if (digitAvailability[digitValue]) {
            continue;
        }

        digitAvailability[digitValue] = true;

        const termToAdd = digitValue * nextDigitCount;
        const newSum = currentAccumulatedSum + termToAdd;

        exploreDigitCombinations(newSum, nextDigitCount);

        digitAvailability[digitValue] = false;
    }
}

exploreDigitCombinations(0, 0);

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLinesArray = fileContent.trim().split("\n");

const parseLineNumbers = (lineStr) => lineStr.split(" ").map(Number);

for (const lineString of inputLinesArray) {
    const parsedInputNumbers = parseLineNumbers(lineString);

    const targetDigitCount = parsedInputNumbers[0];
    const targetSumValue = parsedInputNumbers[1];

    const potentialResult = combinationCounts[targetDigitCount][targetSumValue];

    const calculatedResult = (potentialResult === undefined) ? 0 : potentialResult;

    console.log(calculatedResult);
}
