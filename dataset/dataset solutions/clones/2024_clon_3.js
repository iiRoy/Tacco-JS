function processInputData(rawDataString) {
    const inputLines = rawDataString.split("\n");
    
    const firstLine = inputLines[0];
    const targetNumber = parseInt(firstLine, 10);

    const calculateFloorDivision = (dividend, divisor) => {
        return Math.floor(dividend / divisor);
    };

    const fiveHundredUnitCount = calculateFloorDivision(targetNumber, 500);

    const remainingValue = targetNumber % 500;
    const fiveUnitCount = calculateFloorDivision(remainingValue, 5);

    const finalSum = fiveHundredUnitCount + fiveUnitCount;

    console.log(finalSum);
}

const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processInputData(standardInputContent);
