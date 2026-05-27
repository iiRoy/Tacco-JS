const RESULT_GREATER = 'GREATER';
const RESULT_LESS = 'LESS';
const RESULT_EQUAL = 'EQUAL';

function compareFirstCharacters(s1, s2) {
    const charCode1 = s1.charCodeAt(0);
    const charCode2 = s2.charCodeAt(0);

    if (charCode1 > charCode2) {
        return RESULT_GREATER;
    } else if (charCode1 < charCode2) {
        return RESULT_LESS;
    }
    return RESULT_EQUAL;
}

function performRecursiveStringComparison(currentStringA, currentStringB) {
    const charComparisonOutcome = compareFirstCharacters(currentStringA, currentStringB);

    if (charComparisonOutcome !== RESULT_EQUAL) {
        return charComparisonOutcome;
    } else {
        if (currentStringA.length === 1) {
            return RESULT_EQUAL;
        }
        const nextStringA = currentStringA.slice(1);
        const nextStringB = currentStringB.slice(1);
        return performRecursiveStringComparison(nextStringA, nextStringB);
    }
}

function processInputAndCompare(rawInputContent) {
    const linesArray = rawInputContent.split('\n');
    const firstInputLine = linesArray[0];
    const secondInputLine = linesArray[1];

    const lengthOfFirstLine = firstInputLine.length;
    const lengthOfSecondLine = secondInputLine.length;

    if (lengthOfFirstLine > lengthOfSecondLine) {
        console.log(RESULT_GREATER);
    } else if (lengthOfFirstLine < lengthOfSecondLine) {
        console.log(RESULT_LESS);
    } else {
        console.log(performRecursiveStringComparison(firstInputLine, secondInputLine));
    }
}

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputAndCompare(fileData);
