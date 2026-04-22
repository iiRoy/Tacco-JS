const fileSystemInterface = require("fs");

const sourceData = fileSystemInterface.readFileSync("/dev/stdin", "utf8");

const calculateFactorMetrics = (primaryValue, secondaryValue) => {
    const num1 = Number(primaryValue);
    const num2 = Number(secondaryValue);

    const findCommonDivisor = (firstNum, secondNum) => {
        if (secondNum === 0) {
            return firstNum;
        }
        return findCommonDivisor(secondNum, firstNum % secondNum);
    };

    const greatestCommonDivisorResult = findCommonDivisor(num1, num2);
    const leastCommonMultipleResult = (num1 * num2) / greatestCommonDivisorResult;

    console.log(`${leastCommonMultipleResult} ${greatestCommonDivisorResult}`);
};

sourceData
    .trim()
    .split("\n")
    .forEach(segment => {
        const valueSequence = segment
            .split(" ")
            .map(Number);

        valueSequence.sort((valB, valA) => valA - valB);

        console.log(valueSequence);
        calculateFactorMetrics(valueSequence[0], valueSequence[1]);
    });