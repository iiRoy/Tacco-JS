const calculateIndividualComponentSum = (numericalInput) => {
    let runningTotal = 0;
    let transientValue = numericalInput;
    while (transientValue > 0) {
        runningTotal += transientValue % 10;
        transientValue = Math.floor(transientValue / 10);
    }
    return runningTotal;
};

const evaluateSequence = (currentUpperLimit, currentTestValue) => {
    if (currentTestValue >= currentUpperLimit) {
        return;
    }

    let generatedResult = currentTestValue + calculateIndividualComponentSum(currentUpperLimit - currentTestValue);

    if (currentUpperLimit > generatedResult) {
        evaluateSequence(generatedResult, currentTestValue + 1);
    } else if (currentUpperLimit === generatedResult) {
        console.log(generatedResult);
        return;
    } else {
        evaluateSequence(currentUpperLimit, currentTestValue + 1);
    }
};

const processInputData = (inputData) => {
    const initialTarget = Number(inputData.trim());
    evaluateSequence(initialTarget, 1);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));