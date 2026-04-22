const performCalculationAndOutput = (sourceData) => {
    const [quantityString, valueString] = sourceData.split(' ');
    const totalItems = Number(quantityString);
    const desiredTotal = Number(valueString);

    const outputResult = findArrangement(totalItems, desiredTotal);

    console.log(outputResult);
};

const findArrangement = (totalLimit, desiredTotal) => {
    const adjustedTotal = desiredTotal / 10000;

    const indexOneCollection = Array.from({ length: totalLimit + 1 }, (_, indexOne) => indexOne);

    const matchingConfigurations = indexOneCollection.flatMap(indexOne =>
        Array.from({ length: totalLimit - indexOne + 1 }, (_, indexTwo) => {
            const indexThree = adjustedTotal - (500 * indexOne * indexTwo);

            const isValidThirdComponent = Number.isInteger(indexThree) &&
                                          indexThree >= 0 &&
                                          indexThree <= (totalLimit - indexOne - indexTwo);

            return isValidThirdComponent ? [`${indexOne} ${indexTwo} ${indexThree}`] : [];
        })
    ).filter(arr => arr.length > 0);

    return matchingConfigurations.length > 0 ? matchingConfigurations.pop()[0] : "-1 -1 -1";
};

performCalculationAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));