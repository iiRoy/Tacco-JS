const transformInput = (textData) => {
    const numericalVal = Math.trunc(Number(textData));
    const squareVal = numericalVal * numericalVal;
    const computedOutcome = squareVal >> 2;
    return computedOutcome;
};

const acquiredData = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutput = transformInput(acquiredData);
console.log(finalOutput);