var inputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/);
var totalCases = inputLines.length;

const RADIX_DECIMAL = 10;
const LAST_BALL_CHECK_INDEX = 9;
const NEWLINE_SPLITTER = /\n/;
const WHITESPACE_SPLITTER = /\s/;

function parseBallValuesFromLine(lineContent) {
    const stringNumbers = lineContent.trim().split(WHITESPACE_SPLITTER);
    return stringNumbers.map(str => parseInt(str, RADIX_DECIMAL));
}

for (let caseIndex = 1; caseIndex < totalCases; caseIndex++) {
    const currentCaseLine = inputLines[caseIndex];
    const ballValuesForCase = parseBallValuesFromLine(currentCaseLine);
    
    let currentCourseState = [0, 0];
    let courseCompletionStatus = true;

    for (let ballIndex = 0; ballIndex < ballValuesForCase.length; ballIndex++) {
        const currentBallValue = ballValuesForCase[ballIndex];

        const differenceToSlot0 = currentBallValue - currentCourseState[0];
        const differenceToSlot1 = currentBallValue - currentCourseState[1];

        if (differenceToSlot0 < 0 && differenceToSlot1 < 0) {
            console.log("NO");
            courseCompletionStatus = false;
            break;
        }

        let chosenSlotIndex;
        const shouldUpdateSlot0 = (differenceToSlot0 > 0) && (differenceToSlot0 <= differenceToSlot1);

        if (shouldUpdateSlot0) {
            chosenSlotIndex = 0;
        } else {
            chosenSlotIndex = 1;
        }
        
        currentCourseState[chosenSlotIndex] = currentBallValue;

        if (ballIndex === LAST_BALL_CHECK_INDEX && courseCompletionStatus) {
            console.log("YES");
        }
    }
}
