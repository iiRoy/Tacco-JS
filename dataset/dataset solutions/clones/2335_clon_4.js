const obtainTrailingZeroCount = (valueUnit) => {
    let currentNumericalValue = valueUnit;
    let consecutiveZeroes = 0;
    while (currentNumericalValue > 0 && currentNumericalValue % 10 === 0) {
        consecutiveZeroes++;
        currentNumericalValue /= 10;
    }
    return consecutiveZeroes;
};

const calculateSumOfTrailingZeros = (initialNumber) => {
    const recursiveSum = (currentNum, cumulativeResult) => {
        if (currentNum <= 0) {
            return cumulativeResult;
        }
        const currentNumZeros = obtainTrailingZeroCount(currentNum);
        return recursiveSum(currentNum - 2, cumulativeResult + currentNumZeros);
    };
    return recursiveSum(initialNumber, 0);
};

const executeComputation = (rawData) => {
    const numericalInput = Number(rawData);
    const finalAggregation = calculateSumOfTrailingZeros(numericalInput);
    console.log(finalAggregation);
};

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));