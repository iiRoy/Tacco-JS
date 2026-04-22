'use strict'

const calculateDivisorQuantity = (targetNumber) => {
    const possibleDivisors = Array.from({ length: targetNumber }, (_, indexValue) => indexValue + 1);
    const actualDivisors = possibleDivisors.filter(candidate => targetNumber % candidate === 0);
    return actualDivisors.length;
};

const processInputData = (inputString) => {
    const numericalLimit = Number(inputString);
    const numbersInRange = Array.from({ length: numericalLimit }, (_, currentNum) => currentNum + 1);

    const qualifyingNumbersCount = numbersInRange
        .filter(valToCheck => valToCheck % 2 !== 0) // Keep only odd numbers
        .filter(oddNum => calculateDivisorQuantity(oddNum) === 8) // Keep only those with 8 divisors
        .length; // Count them

    console.log(qualifyingNumbersCount);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));