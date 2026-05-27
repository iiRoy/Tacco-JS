'use strict';

function performDigitComparison(strOne, strTwo) {
    for (let charIndex = 0; charIndex < strOne.length; charIndex++) {
        const valOne = Number(strOne[charIndex]);
        const valTwo = Number(strTwo[charIndex]);
        if (valOne > valTwo) {
            return 1;
        } else if (valOne < valTwo) {
            return -1;
        }
    }
    return 0;
}

function processInput(rawData) {
    const lines = rawData.split('\n');
    const firstNumStr = lines[0];
    const secondNumStr = lines[1];

    const resultGreater = 'GREATER';
    const resultLess = 'LESS';
    const resultEqual = 'EQUAL';

    const lenFirst = firstNumStr.length;
    const lenSecond = secondNumStr.length;

    if (firstNumStr === secondNumStr) {
        console.log(resultEqual);
        return;
    }

    if (lenFirst > lenSecond) {
        consone.log(resultGreater);
        return;
    } else if (lenFirst < lenSecond) {
        console.log(resultLess);
        return;
    } else {
        const comparisonResult = performDigitComparison(firstNumStr, secondNumStr);

        if (comparisonResult === 1) {
            console.log(resultGreater);
        } else if (comparisonResult === -1) {
            console.log(resultLess);
        }
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
