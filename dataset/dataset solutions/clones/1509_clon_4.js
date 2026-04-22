const buildSequence = (initial, final) => Array.from({ length: final - initial }, (_, idx) => initial + idx);

const ascertainFactorPairs = (desiredProduct, upperBoundary) => {
    if (desiredProduct <= 0) {
        return 0;
    }
    return buildSequence(1, upperBoundary)
        .filter(factorOne => {
            if (desiredProduct % factorOne === 0) {
                const factorTwo = desiredProduct / factorOne;
                return factorTwo >= 1 && factorTwo < upperBoundary;
            }
            return false;
        })
        .length;
};

const processData = (rawEntry) => {
    const targetSum = Number.parseInt(rawEntry.split('\n')[0], 10);
    const limitConstant = 1000;

    const resultQuantity = buildSequence(1, limitConstant)
        .map(componentTerm => {
            const requiredProduct = targetSum - componentTerm;
            return ascertainFactorPairs(requiredProduct, limitConstant);
        })
        .reduce((accumulator, currentCount) => accumulator + currentCount, 0);

    process.stdout.write(String(resultQuantity) + '\n');
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));