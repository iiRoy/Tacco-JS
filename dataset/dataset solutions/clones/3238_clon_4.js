function evaluateCharacterSequences(sourceMaterial) {
    const textSegments = sourceMaterial.split('\n');
    const sequenceExtent = Number(textSegments[0]);

    const firstSequence = [...textSegments[1]];
    const secondSequence = [...textSegments[2]];
    const thirdSequence = [...textSegments[3]];

    const cumulativeValue = Array.from({ length: sequenceExtent }, (_, positionIndex) => {
        const charOne = firstSequence[positionIndex];
        const charTwo = secondSequence[positionIndex];
        const charThree = thirdSequence[positionIndex];

        const distinctElements = new Set([charOne, charTwo, charThree]);
        const elementVariety = distinctElements.size;

        if (elementVariety === 1) {
            return 0;
        } else if (elementVariety === 2) {
            return 1;
        } else { // elementVariety === 3
            return 2;
        }
    }).reduce((runningTotal, segmentValue) => runningTotal + segmentValue, 0);

    console.log(cumulativeValue);
}
evaluateCharacterSequences(require("fs").readFileSync("/dev/stdin", "utf8"));