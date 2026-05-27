function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const canFormSequence = (targetValue, sequenceLength) => {
        const sumOfPreviousTerms = sequenceLength * (sequenceLength - 1) / 2;
        const remainingForFirstTerm = targetValue - sumOfPreviousTerms;
        return remainingForFirstTerm >= 0 && remainingForFirstTerm % sequenceLength === 0;
    };

    let lineIdx = 0;
    while (true) {
        const currentLineContent = inputLines[lineIdx];
        const targetNumber = parseInt(currentLineContent, 10);
        let solutionCount = 0;

        if (targetNumber === 0) {
            break;
        }

        for (let currentLength = 2; currentLength < targetNumber; currentLength++) {
            const lengthProductMinusOne = currentLength * (currentLength - 1);
            
            if (canFormSequence(targetNumber, currentLength)) {
                solutionCount++;
            }
        }
        console.log(solutionCount);
        lineIdx++;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
