const dataStream = require("node:fs").readFileSync("/dev/stdin", "utf8");
const processedInteger = parseInt(dataStream.trim(), 10);

const computeRecursiveProduct = (valueToProcess) => {
    if (valueToProcess < 0) {
        return 1;
    }
    if (valueToProcess === 0) {
        return 1;
    }
    return valueToProcess * computeRecursiveProduct(valueToProcess - 1);
};

const ultimateOutcome = computeRecursiveProduct(processedInteger - 1);

console.log(ultimateOutcome);