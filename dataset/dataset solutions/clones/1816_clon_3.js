const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

function processCalculation({ rawData, dataLoader, booleanToText, calculateSum, findMaximum, findMinimum, outputJson }) {
    const [firstOperand] = dataLoader(1, 1, BigInt);
    let [secondOperand] = dataLoader();

    const scaledSecondOperand = BigInt(Math.floor(secondOperand * 1000));

    const product = firstOperand * scaledSecondOperand;
    const finalValue = product / 1000n;
    return finalValue.toString();
}

const parsedTokens = rawData.split(/[\s\n]/);

let finalOutcome = processCalculation({
    rawData,
    booleanToText: value => value ? 'Yes' : 'No',
    calculateSum: numbers => numbers.reduce((acc, cur) => acc + cur, 0),
    dataLoader(numRows = 1, numCols = 1, dataType = Number) {
        const totalElements = numRows * numCols;
        let extractedValues = parsedTokens.splice(0, totalElements);

        if (dataType !== String) {
            extractedValues = extractedValues.map(dataType);
        }

        if (numCols > 1) {
            const columnarData = Array.from({ length: numCols }, () => []);
            for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
                for (let columnIndex = 0; columnIndex < numCols; columnIndex++) {
                    const sourceIndex = rowIndex * numCols + columnIndex;
                    columnarData[columnIndex].push(extractedValues[sourceIndex]);
                }
            }
            extractedValues = columnarData;
        }
        return extractedValues;
    },
    inifinite_loop_preventer() {
        throw new Error("Infinite loop");
    },
    findMaximum,
    findMinimum,
    outputJson(value) {
        console.log(JSON.stringify(value));
    },
});

const handleOutput = (outcome) => {
    if (outcome === undefined) {
        console.warn("result is undefined");
    } else {
        console.log(outcome);
    }
};
handleOutput(finalOutcome);

function findMaximum(numbers, startValue = null) {
    let currentMax;
    if (startValue === null) {
        currentMax = numbers[0];
    } else {
        currentMax = startValue;
    }
    for (const currentNumber of numbers) {
        if (currentNumber > currentMax) {
            currentMax = currentNumber;
        }
    }
    return currentMax;
}

function findMinimum(numbers, startValue = null) {
    let currentMin;
    if (startValue === null) {
        currentMin = numbers[0];
    } else {
        currentMin = startValue;
    }
    for (const currentNumber of numbers) {
        if (currentNumber < currentMin) {
            currentMin = currentNumber;
        }
    }
    return currentMin;
}
