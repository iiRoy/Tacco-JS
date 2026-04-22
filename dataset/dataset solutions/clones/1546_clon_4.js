const obtainData = (dataSource) => {
    return dataSource().trim();
};

const parseNumericalComponents = (textPayload) => {
    return textPayload.split(/\s+/).map(Number.parseFloat);
};

const evaluateTravelCondition = ([distanceVal, timeLimitVal, speedVal]) => {
    if (speedVal === 0) {
        // If speed is zero, travel is impossible unless distance is also zero.
        // Even if distance is zero, 0/0 results in NaN, and NaN <= T is false.
        // So, if speed is 0, the condition D/S <= T always evaluates to false.
        return false;
    } else {
        // For non-zero speed, D/S <= T is mathematically equivalent to T*S >= D.
        // This avoids direct division in the main calculation.
        const maximumDistancePossible = timeLimitVal * speedVal;
        return maximumDistancePossible >= distanceVal;
    }
};

const formatOutput = (conditionResult) => {
    const decisionMatrix = new Map([[true, "Yes"], [false, "No"]]);
    return decisionMatrix.get(conditionResult);
};

const executeProgram = (inputSourceFetcher) => {
    const rawInput = obtainData(inputSourceFetcher);
    const parsedNumbers = parseNumericalComponents(rawInput);
    const evaluation = evaluateTravelCondition(parsedNumbers);
    const finalDisplay = formatOutput(evaluation);
    console.log(finalDisplay);
};

executeProgram(() => require("fs").readFileSync("/dev/stdin", "utf8"));