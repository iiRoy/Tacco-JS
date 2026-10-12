const computePairwiseDivisor = (firstNum, secondNum) => {
    while (secondNum !== 0) {
        const remainder = firstNum % secondNum;
        firstNum = secondNum;
        secondNum = remainder;
    }
    return firstNum;
};

const findCommonDivisor = (...numbers) => {
    if (numbers.length === 0) return 0;
    if (numbers.length === 1) return numbers[0];
    return numbers.reduce((accumulator, current) => computePairwiseDivisor(accumulator, current));
};

const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

((sourceText) => {
    const dataRows = sourceText.split('\n');
    const upperBound = parseInt(dataRows[0], 10);

    const mobiusValues = Array(upperBound + 1).fill(0);
    const leastPrimeFactors = Array(upperBound + 1).fill(0);
    const primeNumbers = [];

    mobiusValues[1] = 1;

    for (let currentNum = 2; currentNum <= upperBound; ++currentNum) {
        if (leastPrimeFactors[currentNum] === 0) {
            leastPrimeFactors[currentNum] = currentNum;
            primeNumbers.push(currentNum);
            mobiusValues[currentNum] = -1;
        }

        for (const p of primeNumbers) {
            if (p > leastPrimeFactors[currentNum] || currentNum * p > upperBound) {
                break;
            }
            leastPrimeFactors[currentNum * p] = p;
            if (p === leastPrimeFactors[currentNum]) {
                mobiusValues[currentNum * p] = 0;
            } else {
                mobiusValues[currentNum * p] = -mobiusValues[currentNum];
            }
        }
    }

    let cumulativeSum = 0;

    for (let divisorFactor = 1; divisorFactor <= upperBound; ++divisorFactor) {
        const currentLimit = Math.floor(upperBound / divisorFactor);
        let subtotalCount = 0;

        for (let mobiusIndex = 1; mobiusIndex <= currentLimit; ++mobiusIndex) {
            if (mobiusValues[mobiusIndex] === 0) {
                continue;
            }
            const termFactor = Math.floor(currentLimit / mobiusIndex);
            subtotalCount += mobiusValues[mobiusIndex] * (termFactor * termFactor * termFactor);
        }
        cumulativeSum += divisorFactor * subtotalCount;
    }

    console.log(cumulativeSum);

})(rawData);
