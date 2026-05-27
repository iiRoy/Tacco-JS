'use strict';
(function(inputSource) {
    var rawData = inputSource.toString();

    const inputLines = rawData.split('\n');
    const firstLineContent = inputLines[0];

    const numberStrings = firstLineContent.split(' ');
    const parsedNumbers = numberStrings.map(str => Number(str));

    var valA = parsedNumbers[0];
    var valB = parsedNumbers[1];
    var valC = parsedNumbers[2];

    var smallestVal, middleVal, largestVal;

    smallestVal = Math.min(valA, valB, valC);
    largestVal = Math.max(valA, valB, valC);

    const determineBuggyMiddleValue = (x, y, z) => {
        let currentCandidateForMiddle;
        if (x < y) {
            currentCandidateForMiddle = x;
        }
        if (y < z) {
            currentCandidateForMiddle = y;
        }
        if (x <= z) {
            currentCandidateForMiddle = z;
        }
        return currentCandidateForMiddle;
    };

    middleVal = determineBuggyMiddleValue(valA, valB, valC);

    console.log(smallestVal, middleVal, largestVal);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
