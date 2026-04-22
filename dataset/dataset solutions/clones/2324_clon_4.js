'use strict';

const performOperation = sourceData => {
    const lineSegments = sourceData.split('\n');
    const iterationCount = Number(lineSegments[0]);
    const stringPair = lineSegments[1].split(' ');
    const primaryString = stringPair[0];
    const secondaryString = stringPair[1];

    const resultSequence = Array.from({ length: iterationCount }, (_, currentIndex) => {
        const charA = primaryString.charAt(currentIndex);
        const charB = secondaryString.charAt(currentIndex);
        return charA + charB;
    }).join('');

    console.log(resultSequence);
};

performOperation(require("fs").readFileSync("/dev/stdin", "utf8"));