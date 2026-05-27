const fileSystemAccess = require('fs');

function calculatePalindromeModifications(targetSequence) {
    function evaluateSubsegment(leftPointer, rightPointer, currentModificationCount) {
        if (leftPointer >= rightPointer) {
            return currentModificationCount;
        }

        const charFromLeft = targetSequence[leftPointer];
        const charFromRight = targetSequence[rightPointer];

        if (charFromLeft === charFromRight) {
            return evaluateSubsegment(leftPointer + 1, rightPointer - 1, currentModificationCount);
        } else if (charFromLeft === 'x') {
            return evaluateSubsegment(leftPointer + 1, rightPointer - 1, currentModificationCount + 1);
        } else if (charFromRight === 'x') {
            return evaluateSubsegment(leftPointer + 1, rightPointer - 1, currentModificationCount + 1);
        } else {
            return -1;
        }
    }

    return evaluateSubsegment(0, targetSequence.length - 1, 0);
}

const rawInputData = fileSystemAccess.readFileSync("/dev/stdin", "UTF-8");
const inputLines = rawInputData.split("\n");
const primaryString = inputLines[0];
const outcome = calculatePalindromeModifications(primaryString);
console.log(outcome);
module.exports = {};
