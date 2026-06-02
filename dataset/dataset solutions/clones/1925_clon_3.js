function parseNumericParams(inputString) {
    return inputString.split(' ').map(value => parseInt(value, 10));
}

function computeFloorDifference(valA, valB, valN) {
    let resultAccumulator = 0;
    let loopCounter = valN;
    let nonImprovementStreak = 0;

    const MAX_NON_IMPROVEMENT_THRESHOLD = 30;

    while (loopCounter > 0) {
        const firstTerm = Math.floor(valA * loopCounter / valB);
        const secondTerm = valA * Math.floor(loopCounter / valB);
        const currentCalculatedValue = firstTerm - secondTerm;

        if (currentCalculatedValue > resultAccumulator) {
            resultAccumulator = currentCalculatedValue;
            break;
        } else {
            nonImprovementStreak++;
            if (nonImprovementStreak > MAX_NON_IMPROVEMENT_THRESHOLD) {
                break;
            }
        }
        loopCounter--;
    }
    return resultAccumulator;
}

function processInputData(rawInputData) {
    const processedLines = rawInputData.trim().split("\n");
    const numericParameters = parseNumericParams(processedLines[0]);

    const parameterA = numericParameters[0];
    const parameterB = numericParameters[1];
    const parameterN = numericParameters[2];

    const finalOutputValue = computeFloorDifference(parameterA, parameterB, parameterN);

    console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
