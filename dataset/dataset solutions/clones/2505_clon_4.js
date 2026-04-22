const transformData = (dataString) => {
    const contentLines = dataString.split('\n').filter(Boolean);

    const elementQuantity = parseInt(contentLines[0].split(' ')[0], 10);
    const rawNumbers = contentLines[1].split(' ').map(Number).sort((x, y) => x - y);

    const frequencyRegister = rawNumbers.reduce((accumulator, numberValue) => {
        accumulator.set(numberValue, (accumulator.get(numberValue) || 0) + 1);
        return accumulator;
    }, new Map());

    const sortedFrequencies = Array.from(frequencyRegister.values()).sort((x, y) => x - y);

    const accumulatedSums = sortedFrequencies.reduce((sumsList, currentFrequency, indexPosition) => {
        const previousTotal = indexPosition > 0 ? sumsList[indexPosition - 1] : 0;
        sumsList.push(previousTotal + currentFrequency);
        return sumsList;
    }, []);

    const finalResults = Array.from({ length: elementQuantity }, (_, zeroBasedIndex) => zeroBasedIndex + 1).map(currentIterationDivisor => {
        const maximumQuotient = Math.floor(elementQuantity / currentIterationDivisor);

        const sumLookupIndex = sortedFrequencies.length - currentIterationDivisor;
        const currentFrequencyRangeSum = sumLookupIndex >= 0 ? accumulatedSums[sumLookupIndex] : 0;

        const productOfSumAndDivisor = currentFrequencyRangeSum * currentIterationDivisor;

        return Math.min(maximumQuotient, productOfSumAndDivisor);
    });

    return finalResults.join('\n');
};

console.log(transformData(require("fs").readFileSync("/dev/stdin", "utf8")));