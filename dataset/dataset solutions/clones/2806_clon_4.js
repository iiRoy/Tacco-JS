const determineGreatestCommonDivisor = (firstVal, secondVal) => {
    while (secondVal !== 0) {
        let temporary = secondVal;
        secondVal = firstVal % secondVal;
        firstVal = temporary;
    }
    return firstVal;
};

const calculateLeastCommonMultiple = (valOne, valTwo) => {
    if (valOne === 0 || valTwo === 0) return 0;
    return (Math.abs(valOne * valTwo)) / determineGreatestCommonDivisor(valOne, valTwo);
};

const countMultiplesInRange = (upperBound, lowerBoundMinusOne, factor) => {
    if (factor === 0) return 0;
    return Math.floor(upperBound / factor) - Math.floor(lowerBoundMinusOne / factor);
};

const processInputAndCompute = (inputDataString) => {
    const numericValues = inputDataString.split(" ").map(entry => parseInt(entry, 10));

    const initialBound = numericValues[0];
    const finalBound = numericValues[1];
    const exclusionFactorOne = numericValues[2];
    const exclusionFactorTwo = numericValues[3];

    const totalElements = finalBound - initialBound + 1;

    const countDivisibleByOne = countMultiplesInRange(finalBound, initialBound - 1, exclusionFactorOne);
    const countDivisibleByTwo = countMultiplesInRange(finalBound, initialBound - 1, exclusionFactorTwo);

    const commonMultiple = calculateLeastCommonMultiple(exclusionFactorOne, exclusionFactorTwo);
    const countDivisibleByBoth = countMultiplesInRange(finalBound, initialBound - 1, commonMultiple);

    const countExcluded = countDivisibleByOne + countDivisibleByTwo - countDivisibleByBoth;

    const finalResult = totalElements - countExcluded;
    
    console.log(finalResult);
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));