const parseNumericValue = (str) => Number(str);

const calculateSumOfNumbers = (numbersArray) => {
    return numbersArray.reduce((accumulator, currentNumber) => accumulator + currentNumber, 0);
};

const calculateSumOfSquaredDeviations = (numbersArray, averageValue) => {
    return numbersArray.reduce((accumulator, currentNumber) => {
        const deviationFromMean = currentNumber - averageValue;
        return accumulator + Math.pow(deviationFromMean, 2);
    }, 0);
};

process.stdin.on("data", (inputChunk) => {
    const fullInputString = inputChunk.toString();
    const inputLines = fullInputString.trim().split("\n");
    let currentPositionIndex = 0;

    const LINE_INCREMENT_STEP = 2;

    while (parseNumericValue(inputLines[currentPositionIndex])) {
        const dataPointCount = parseNumericValue(inputLines[currentPositionIndex]);
        const rawValuesString = inputLines[currentPositionIndex + 1];
        const stringValueArray = rawValuesString.split(" ");

        const numericDataPoints = stringValueArray.map(parseNumericValue);

        const totalSum = calculateSumOfNumbers(numericDataPoints);
        const arithmeticMean = totalSum / dataPointCount;

        const sumOfSquares = calculateSumOfSquaredDeviations(numericDataPoints, arithmeticMean);

        const varianceValue = sumOfSquares / dataPointCount;
        const standardDeviationResult = Math.sqrt(varianceValue);

        console.log(standardDeviationResult.toFixed(8));

        currentPositionIndex += LINE_INCREMENT_STEP;
    }
}).resume();
