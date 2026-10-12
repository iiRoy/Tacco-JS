function processInputData(rawData) {
    const processedLines = rawData.split("\n");
    const calculateAbsoluteDifference = Math.abs;

    for (let lineIndex = 0; lineIndex < processedLines.length; lineIndex += 2) {
        const currentNValue = parseInt(processedLines[lineIndex], 10);
        const digitStringArray = processedLines[lineIndex + 1].split("");
        let numberSequence = digitStringArray.map(Number);

        const outerIterationLimit = currentNValue;

        for (let outerLoopCounter = outerIterationLimit; outerLoopCounter > 1; outerLoopCounter -= 1) {
            const innerIterationLimit = outerLoopCounter;

            for (let innerLoopCounter = 0; innerLoopCounter < innerIterationLimit; innerLoopCounter += 1) {
                const firstValueInSequence = numberSequence[0];
                const secondValueInSequence = numberSequence[1];
                const computedDifference = calculateAbsoluteDifference(firstValueInSequence - secondValueInSequence);

                numberSequence.splice(0, 1);
                numberSequence.push(computedDifference);
            }
            numberSequence.pop();
        }
        console.log(numberSequence[0]);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
