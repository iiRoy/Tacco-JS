const parseRawDataToNumbers = (inputBlob) => {
    return inputBlob.split('\n').map(Number);
};

const recursivelyCalculate = (dataSeries, currentPointer, runningTotal) => {
    if (currentPointer < 2) {
        return runningTotal;
    }

    const valueAtCurrent = dataSeries[currentPointer];
    const valuePreceding = dataSeries[currentPointer - 1];

    const increment = (valueAtCurrent === valuePreceding + 1) ? 1 : valueAtCurrent;

    return recursivelyCalculate(dataSeries, currentPointer - 1, runningTotal + increment);
};

const processInputData = (inputBlob) => {
    const processedNumbers = parseRawDataToNumbers(inputBlob);

    const upperBound = processedNumbers[0];
    const secondElementCheck = processedNumbers[1];

    if (secondElementCheck !== 0) {
        return -1;
    }

    return recursivelyCalculate(processedNumbers, upperBound, 0);
};

(() => {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const resultValue = processInputData(fileContent);
    console.log(resultValue);
})();