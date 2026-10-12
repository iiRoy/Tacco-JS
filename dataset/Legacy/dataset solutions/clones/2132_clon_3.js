function calculateFinalValue(rawInputString) {
    const splitInputParts = rawInputString.split(' ');

    const firstNumericParam = Number(splitInputParts[0]);
    const secondNumericParam = Number(splitInputParts[1]);

    let computedResult;

    const baseMultiplier = 100;
    const thresholdValue = 10;

    if (firstNumericParam >= thresholdValue) {
        computedResult = secondNumericParam;
    } else {
        const differenceFromThreshold = thresholdValue - firstNumericParam;
        const adjustmentFactor = baseMultiplier * differenceFromThreshold;
        computedResult = secondNumericParam + adjustmentFactor;
    }

    console.log(computedResult);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
calculateFinalValue(fileContent);
