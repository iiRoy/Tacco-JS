function processInput(rawData) {
    const lines = rawData.split("\n");
    const arraySizeFactor = parseInt(lines[0], 10);
    const initialValuesStr = lines[1].split(" ");

    const parseInteger = (str) => parseInt(str, 10);

    const initialNumericArray = initialValuesStr.map(parseInteger);

    const findMedianOfThree = (valA, valB, valC) => {
        const sumOfValues = valA + valB + valC;
        const minimumValue = Math.min(valA, valB, valC);
        const maximumValue = Math.max(valA, valB, valC);
        return sumOfValues - minimumValue - maximumValue;
    };

    function computeNextMedianArray(currentSequence) {
        const nextSequenceLength = currentSequence.length - 2;
        const nextSequence = new Array(nextSequenceLength);

        for (let subIdx = 0; subIdx < nextSequenceLength; subIdx++) {
            const firstVal = currentSequence[subIdx];
            const secondVal = currentSequence[subIdx + 1];
            const thirdVal = currentSequence[subIdx + 2];
            nextSequence[subIdx] = findMedianOfThree(firstVal, secondVal, thirdVal);
        }
        return nextSequence;
    }

    let currentSequence = initialNumericArray;
    let intermediateSequenceResult;

    while (currentSequence.length > 1) {
        intermediateSequenceResult = computeNextMedianArray(currentSequence);
        currentSequence = intermediateSequenceResult;
    }
    console.log(currentSequence[0]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
