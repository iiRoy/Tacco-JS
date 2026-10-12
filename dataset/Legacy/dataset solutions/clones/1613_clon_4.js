const processInput = require("fs").readFileSync("/dev/stdin", "utf8");
const dataTokens = processInput.split(/ |\n/).filter(Boolean);
const totalElements = parseInt(dataTokens[0], 10);
const numberRepresentations = dataTokens.slice(1, totalElements + 1);

const analyzeNumberString = (numTxt) => {
    const parts = numTxt.split('.');
    if (parts.length === 1) {
        return { integerValue: parseInt(numTxt, 10), decimalPower: 0 };
    } else {
        const combinedDigits = parseInt(parts[0] + parts[1], 10);
        const decimalExponent = parts[1].length;
        return { integerValue: combinedDigits, decimalPower: decimalExponent };
    }
};

const countPrimeDivisors = (value, prime) => {
    if (value === 0) return 0;
    let divisorCount = 0;
    let currentVal = value;
    while (currentVal > 0 && currentVal % prime === 0) {
        divisorCount++;
        currentVal /= prime;
    }
    return divisorCount;
};

const resultAccumulator = Array.from({ length: totalElements }, (_, outerIndex) => outerIndex + 1)
    .reduce((currentResult, secondOperandIndex) => {
        Array.from({ length: secondOperandIndex - 1 }, (_, innerIndex) => innerIndex + 1)
            .forEach((firstOperandIndex) => {
                const stringA = numberRepresentations[firstOperandIndex - 1];
                const stringB = numberRepresentations[secondOperandIndex - 1];

                const hasPointA = stringA.includes('.');
                const hasPointB = stringB.includes('.');

                if (hasPointA && hasPointB) {
                    return;
                }

                const infoA = analyzeNumberString(stringA);
                const infoB = analyzeNumberString(stringB);

                const productNumerator = infoA.integerValue * infoB.integerValue;
                const combinedDecimalPower = infoA.decimalPower + infoB.decimalPower;

                if (combinedDecimalPower === 0) {
                    currentResult.validPairs++;
                } else if (productNumerator === 0) {
                    currentResult.validPairs++;
                } else {
                    const factorsOfTwo = countPrimeDivisors(productNumerator, 2);
                    const factorsOfFive = countPrimeDivisors(productNumerator, 5);

                    if (factorsOfTwo >= combinedDecimalPower && factorsOfFive >= combinedDecimalPower) {
                        currentResult.validPairs++;
                    }
                }
            });
        return currentResult;
    }, { validPairs: 0 });

console.log(resultAccumulator.validPairs);
