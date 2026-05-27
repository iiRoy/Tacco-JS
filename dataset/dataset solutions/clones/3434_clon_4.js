function processInputData(inputContent) {
    const numericInput = Number(inputContent);

    const calculateProductSeries = (limitValue) => {
        if (limitValue < 0) return 1;
        if (limitValue === 0) return 1;
        return Array.from({ length: limitValue }, (_, index) => index + 1)
                    .reduce((productAccumulator, currentNumber) => productAccumulator * currentNumber, 1);
    };
    const factorialResult = calculateProductSeries(numericInput);

    const findProperFactors = (valueToFactor) => {
        const factorsCollection = [];
        const searchLimit = Math.floor(valueToFactor / 2);
        for (let candidate = 1; candidate <= searchLimit; candidate++) {
            if (valueToFactor % candidate === 0) {
                factorsCollection.push(candidate);
            }
        }
        return factorsCollection;
    };
    const properFactorsOfFactorial = findProperFactors(factorialResult);

    const assessDivisorProperties = (numberValue) => {
        const halfValue = numberValue / 2;
        const innerLoopUpper = Math.floor(halfValue);
        if (innerLoopUpper < 1) return 0;

        return Array.from({ length: innerLoopUpper }, (_, idx) => idx + 1)
                    .filter(divisorCandidate => halfValue % divisorCandidate === 0)
                    .length;
    };

    const finalCount = properFactorsOfFactorial.reduce((accumulatorForCount, currentFactor) => {
        const divisorCountForHalf = assessDivisorProperties(currentFactor);
        if (divisorCountForHalf === 75) {
            return accumulatorForCount + 1;
        }
        return accumulatorForCount;
    }, 0);

    console.log(finalCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
