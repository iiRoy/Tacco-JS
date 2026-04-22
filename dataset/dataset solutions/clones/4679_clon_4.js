"use strict";

((sourceDatum) => {
    const digitComponents = sourceDatum.trim().split(/\s+/).map(Number);

    const spanValue = digitComponents[0];
    const initialPositionA = digitComponents[1];
    const initialPositionB = digitComponents[2];

    const firstSegmentBegin = initialPositionA;
    const firstSegmentEnd = initialPositionA + spanValue;
    const secondSegmentBegin = initialPositionB;
    const secondSegmentEnd = initialPositionB + spanValue;

    const maximumStart = Math.max(firstSegmentBegin, secondSegmentBegin);
    const minimumEnd = Math.min(firstSegmentEnd, secondSegmentEnd);

    const finalResult = Math.max(0, maximumStart - minimumEnd);

    console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));