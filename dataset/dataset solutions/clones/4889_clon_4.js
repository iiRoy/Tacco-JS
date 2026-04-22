const extractComponents = (rawTextualData) => {
    const linesOfData = rawTextualData.split('\n');
    return {
        numericalThreshold: Number(linesOfData[0]),
        initialSequence: linesOfData[1],
        subsequentSequence: linesOfData[2],
    };
};

const processSequences = (threshold, seqOne, seqTwo) => {
    const lengthOne = seqOne.length;
    const lengthTwo = seqTwo.length;
    const maximumPossibleMatch = Math.min(lengthOne, lengthTwo);

    const locateOptimalMatch = (currentTestLength) => {
        if (currentTestLength < 0) {
            return 0;
        }

        const endingOfSeqOne = seqOne.slice(lengthOne - currentTestLength);
        const beginningOfSeqTwo = seqTwo.slice(0, currentTestLength);

        const segmentsAlign = (endingOfSeqOne === beginningOfSeqTwo);
        const combinedLengthCheck = (lengthOne + lengthTwo - currentTestLength >= threshold);

        if (segmentsAlign && combinedLengthCheck) {
            return currentTestLength;
        } else {
            return locateOptimalMatch(currentTestLength - 1);
        }
    };

    const finalOverlapLength = locateOptimalMatch(maximumPossibleMatch);

    const constructedOutput = seqOne.slice(0, lengthOne - finalOverlapLength) + seqTwo;
    return constructedOutput;
};

(function() {
    const systemInterface = require("fs");
    const rawInputContent = systemInterface.readFileSync("/dev/stdin", "utf8").trim();
    const parsedInputElements = extractComponents(rawInputContent);

    const finalRenderedString = processSequences(
        parsedInputElements.numericalThreshold,
        parsedInputElements.initialSequence,
        parsedInputElements.subsequentSequence
    );

    console.log(finalRenderedString);
})();