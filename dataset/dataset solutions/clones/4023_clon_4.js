const acquiredData = (function () {
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin";
    const encodingScheme = "utf8";
    return fileSystemModule.readFileSync(standardInputPath, encodingScheme);
})();

const breakPosition = acquiredData.indexOf('\n');
const firstSegment = acquiredData.substring(0, breakPosition);
const secondSegment = acquiredData.substring(breakPosition + 1);

const primaryNumericValue = Number(firstSegment);
const secondaryNumericValue = Number(secondSegment);

const obtainRemainder = (dividend, divisor) => {
    if (dividend < divisor) {
        return dividend;
    } else {
        return obtainRemainder(dividend - divisor, divisor);
    }
};

const computedRemainder = obtainRemainder(primaryNumericValue, 500);
const evaluationResult = (computedRemainder <= secondaryNumericValue);

const outcomeStrings = ["NO", "YES"];
process.stdout.write(outcomeStrings[Number(evaluationResult)] + '\n');