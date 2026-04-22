const systemIO = require('node:fs');

function checkPalindromeRecursively(stringToAnalyze, leftIdx, rightIdx, modifications) {
    if (leftIdx >= rightIdx) {
        return modifications;
    }

    const charLeft = stringToAnalyze[leftIdx];
    const charRight = stringToAnalyze[rightIdx];

    if (charLeft === charRight) {
        return checkPalindromeRecursively(stringToAnalyze, leftIdx + 1, rightIdx - 1, modifications);
    } else if (charLeft === 'x') {
        return checkPalindromeRecursively(stringToAnalyze, leftIdx + 1, rightIdx - 1, modifications + 1);
    } else if (charRight === 'x') {
        return checkPalindromeRecursively(stringToAnalyze, leftIdx + 1, rightIdx - 1, modifications + 1);
    } else {
        return -1;
    }
}

const inputContent = systemIO.readFileSync('/dev/stdin', 'utf8');
const firstInputLine = inputContent.split('\n')[0];
const finalResult = checkPalindromeRecursively(firstInputLine, 0, firstInputLine.length - 1, 0);
console.log(finalResult);