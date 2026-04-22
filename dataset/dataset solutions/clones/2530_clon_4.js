function processInputData(rawData) {
    const numericStrings = rawData.split(" ");
    const numA = Number(numericStrings[0]);
    const numB = Number(numericStrings[1]);

    const commonFactor = findGreatestCommonDivisor(numA, numB);
    const result = calculateUniquePrimeFactorsPlusOne(commonFactor);

    console.log(result);
}

function findGreatestCommonDivisor(val1, val2) {
    while (val2 !== 0) {
        const remainder = val1 % val2;
        val1 = val2;
        val2 = remainder;
    }
    return val1;
}

function calculateUniquePrimeFactorsPlusOne(numberToFactor) {
    if (numberToFactor === 1) {
        return 1;
    }

    let distinctFactorCounter = 0;
    let currentNumber = numberToFactor;

    if (currentNumber % 2 === 0) {
        distinctFactorCounter++;
        while (currentNumber % 2 === 0) {
            currentNumber /= 2;
        }
    }

    for (let currentDivisor = 3; currentDivisor * currentDivisor <= currentNumber; currentDivisor += 2) {
        if (currentNumber % currentDivisor === 0) {
            distinctFactorCounter++;
            while (currentNumber % currentDivisor === 0) {
                currentNumber /= currentDivisor;
            }
        }
    }

    if (currentNumber > 1) {
        distinctFactorCounter++;
    }

    return distinctFactorCounter + 1;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));