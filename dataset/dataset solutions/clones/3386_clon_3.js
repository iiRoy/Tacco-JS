const calculateTotalSum = (dataArray) => {
    return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

const calculateSumExcludingOnes = (dataArray) => {
    const filteredValues = dataArray.filter(valueItem => valueItem !== 1);
    return filteredValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

function processGameInput(rawData) {
    const inputLines = rawData.split("\n");
    const initialCountString = inputLines.shift(); // The first line is discarded as per original logic
    const numericValues = inputLines.map(valueString => Number(valueString));

    let gameResultIndicator;

    const totalSumOfAllValues = calculateTotalSum(numericValues);
    gameResultIndicator = totalSumOfAllValues;

    const currentDataArrayLength = numericValues.length;
    const isTotalSumEqualToLength = (gameResultIndicator === currentDataArrayLength);

    if (isTotalSumEqualToLength) {
        gameResultIndicator = 1;
    }

    const sumOfValuesExcludingOne = calculateSumExcludingOnes(numericValues);
    const isSumExcludingOneOdd = (sumOfValuesExcludingOne % 2) !== 0;

    if (isSumExcludingOneOdd) {
        gameResultIndicator = 1;
    }

    const finalDecisionValue = gameResultIndicator;
    const isFinalValueOdd = (finalDecisionValue % 2) !== 0;

    if (isFinalValueOdd) {
        console.log("first");
    } else {
        console.log("second");
    }
}

processGameInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
