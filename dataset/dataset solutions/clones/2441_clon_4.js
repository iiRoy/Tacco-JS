const retrieveInputData = require("node:fs").readFileSync;
const transmitOutput = process.stdout.write;

const calculateAndFormat = (sourceData) => {
    const numericalValue = Number(sourceData);
    const parityIndicator = numericalValue & 1; // 0 for even, 1 for odd
    const adjustedValue = numericalValue - (2 - parityIndicator);
    const finalResult = adjustedValue >> 1; // Bitwise right shift for integer division
    return String(finalResult) + '\n';
};

transmitOutput(calculateAndFormat(retrieveInputData("/dev/stdin", "utf8").trim()));