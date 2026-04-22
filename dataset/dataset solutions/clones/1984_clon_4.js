function calculateSumOfMultiples(divisor, limit) {
    const termCount = Math.floor(limit / divisor);
    return divisor * (termCount * (termCount + 1) / 2);
}

function determineFilteredSum(rawInput) {
    const upperBoundary = Number(rawInput);

    const sumAllNumbers = calculateSumOfMultiples(1, upperBoundary);
    const sumMultiplesOfThree = calculateSumOfMultiples(3, upperBoundary);
    const sumMultiplesOfFive = calculateSumOfMultiples(5, upperBoundary);
    const sumMultiplesOfFifteen = calculateSumOfMultiples(15, upperBoundary);

    const resultantValue = sumAllNumbers - sumMultiplesOfThree - sumMultiplesOfFive + sumMultiplesOfFifteen;

    outputFinalResult(resultantValue);
}

function outputFinalResult(computedValue) {
    console.log(computedValue);
}

determineFilteredSum(require("fs").readFileSync("/dev/stdin", "utf8"));