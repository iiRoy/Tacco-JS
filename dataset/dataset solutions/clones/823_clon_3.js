function ProcessInputData(rawDataLines) {
    const processedLines = rawDataLines.split("\n");

    let lineIndex = 0;
    while (true) {
        const currentLineValue = processedLines[lineIndex];
        const currentNumber = parseInt(currentLineValue, 10);

        if (currentNumber === 0) {
            break;
        }

        let validCount = 0;

        const evaluateCondition = (numValue, candidateDivisor) => {
            const sumOfPreviousIntegers = candidateDivisor * (candidateDivisor - 1) / 2;
            const differenceValue = numValue - sumOfPreviousIntegers;

            const isDifferencePositive = differenceValue > 0;
            const isDifferenceDivisible = differenceValue % candidateDivisor === 0;

            return isDifferencePositive && isDifferenceDivisible;
        };

        for (let divisorCandidate = 2; divisorCandidate < currentNumber; divisorCandidate++) {
            if (evaluateCondition(currentNumber, divisorCandidate)) {
                validCount++;
            }
        }
        console.log(validCount);
        lineIndex++;
    }
}

(function executeProgram() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    ProcessInputData(fileContent);
})();
