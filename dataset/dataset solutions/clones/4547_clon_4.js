const analyzeInputValues = (sourceText) => {
    const { totalOfDivisibleByTen, nonDivisibleCollection } = sourceText.split('\n').slice(1).map(Number).reduce((accumulator, currentNumeric) => {
        if (currentNumeric % 10 === 0) {
            accumulator.totalOfDivisibleByTen += currentNumeric;
        } else {
            accumulator.nonDivisibleCollection.push(currentNumeric);
        }
        return accumulator;
    }, { totalOfDivisibleByTen: 0, nonDivisibleCollection: [] });

    return { totalOfDivisibleByTen, nonDivisibleCollection };
};

const produceAllPossibleSubtotals = (itemsToSum) => {
    let currentSetOfSums = new Set([0]);

    for (const itemElement of itemsToSum) {
        const sumsToAdd = new Set();
        for (const existingSum of currentSetOfSums) {
            sumsToAdd.add(existingSum + itemElement);
        }
        for (const newSumEntry of sumsToAdd) {
            currentSetOfSums.add(newSumEntry);
        }
    }
    return Array.from(currentSetOfSums);
};

const processInputAndComputeFinalResult = (initialData) => {
    const { totalOfDivisibleByTen, nonDivisibleCollection } = analyzeInputValues(initialData);

    const allSubtotalsFromNonDivisible = produceAllPossibleSubtotals(nonDivisibleCollection);

    let ultimateMaximum = 0;

    for (const subtotal of allSubtotalsFromNonDivisible) {
        const combinedSum = subtotal + totalOfDivisibleByTen;
        if (combinedSum % 10 !== 0) {
            if (combinedSum > ultimateMaximum) {
                ultimateMaximum = combinedSum;
            }
        }
    }

    return ultimateMaximum;
};

console.log(processInputAndComputeFinalResult(require("fs").readFileSync("/dev/stdin", "utf8")));