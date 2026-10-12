const processInput = (rawInputContent) => {
    const lineSegments = rawInputContent.split('\n');
    const sourceDigitSequence = Array.from(lineSegments[1], (charValue) => Number(charValue));

    const checkSequentialMatch = (targetNumericValue, sourceNumericArray) => {
        const targetStringRepresentation = String(targetNumericValue);
        const targetDigitComponents = Array.from(targetStringRepresentation, (digitChar) => Number(digitChar));

        let currentTargetComponentIndex = 0;
        for (let sourceArrayTraversalIndex = 0; sourceArrayTraversalIndex < sourceNumericArray.length; sourceArrayTraversalIndex++) {
            if (currentTargetComponentIndex < 3 && targetDigitComponents[currentTargetComponentIndex] === sourceNumericArray[sourceArrayTraversalIndex]) {
                currentTargetComponentIndex++;
            }
            if (currentTargetComponentIndex === 3) {
                break;
            }
        }
        return currentTargetComponentIndex === 3;
    };

    const threeDigitNumberRange = Array.from({ length: 900 }, (_, indexOffset) => 100 + indexOffset);

    const finalAccumulatedCount = threeDigitNumberRange.reduce((currentTotal, currentCandidateNumber) => {
        if (checkSequentialMatch(currentCandidateNumber, sourceDigitSequence)) {
            return currentTotal + 1;
        }
        return currentTotal;
    }, 0);

    console.log(finalAccumulatedCount);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
