'use strict';
const executeOperation = (inputSource) => {
    const parseCoordinates = (textSegment) => {
        let elements = [];
        let currentDigitString = '';
        for (let k = 0; k < textSegment.length; ++k) {
            if (textSegment[k] === ' ') {
                elements.push(Number(currentDigitString));
                currentDigitString = '';
            } else {
                currentDigitString += textSegment[k];
            }
        }
        elements.push(Number(currentDigitString));
        return elements;
    };

    const [boundary, positionA, positionB] = parseCoordinates(inputSource[0]);

    const traversalDelta = positionB - positionA;

    const firstPath = positionB - 1;
    const secondPath = boundary - positionA;

    const outcome = ((traversalDelta & 1) !== 0)
        ? (firstPath > secondPath ? secondPath : firstPath)
        : traversalDelta / 2;

    console.log(outcome);
};

executeOperation(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));