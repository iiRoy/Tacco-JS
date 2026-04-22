const parseInputData = (incomingString) => {
    const numericValues = incomingString.trim().split(" ").map(Number);
    return {
        firstComponent: numericValues[0],
        secondComponent: numericValues[1]
    };
};

const determinePowerCoefficient = (thresholdVal, iterationVal) => {
    if (thresholdVal <= iterationVal) {
        return 1;
    }
    let currentPower = 1;
    while (thresholdVal > iterationVal * currentPower) {
        currentPower <<= 1;
        // Safety break for extremely large or pathological inputs, though unlikely with typical constraints.
        // Original code had an implicit limit due to 'j < 100000'.
        if (currentPower > Number.MAX_SAFE_INTEGER / 2) { // Prevent overflow and infinite loop
             return currentPower;
        }
    }
    return currentPower;
};

const computeExpectedValue = (inputBlob) => {
    const { firstComponent: upperLimit, secondComponent: minimumTarget } = parseInputData(inputBlob);

    const sequence = Array.from({ length: upperLimit }, (_, index) => index + 1);

    const accumulatedValue = sequence.reduce((currentSum, elementValue) => {
        const initialFraction = 1 / upperLimit;
        const requiredPowerOfTwo = determinePowerCoefficient(minimumTarget, elementValue);
        const contribution = initialFraction / requiredPowerOfTwo;
        return currentSum + contribution;
    }, 0);

    return accumulatedValue;
};

const processExecution = (dataStream) => {
    const result = computeExpectedValue(dataStream);
    console.log(result);
};

processExecution(require("fs").readFileSync("/dev/stdin", "utf8"));