const inputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = inputBuffer.trim().split('\n');
let currentLineIndex = 0;

function getNextInputLine() {
    return inputLines[currentLineIndex++];
}

function executeProcessingLogic() {
    let innerLoopCounter, unusedVarK, outerLoopCounter, unusedVarB, unusedVarC, unusedVarW, mainCount, accumulatedSum;

    for (outerLoopCounter = 0; ; outerLoopCounter++) {
        accumulatedSum = 0;

        const lineInputOne = getNextInputLine();
        const parsedCount = parseInt(lineInputOne, 10);

        if (parsedCount === 0) {
            break;
        }

        for (innerLoopCounter = 0; innerLoopCounter < parsedCount / 4; innerLoopCounter++) {
            const lineInputTwo = getNextInputLine();
            const parsedValue = parseInt(lineInputTwo, 10);
            accumulatedSum = accumulatedSum + parsedValue;
        }

        console.log(accumulatedSum);
    }
}

executeProcessingLogic();
