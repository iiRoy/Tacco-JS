function ProcessNumericalSeries(inputDataPayload) {
    const dataRows = inputDataPayload.split('\n');
    const numericStringRepresentation = dataRows[1];

    const seriesOfBigIntegers = numericStringRepresentation.split(' ').map(strVal => BigInt(strVal));

    const CONSTANT_MODIFIER = 10n ** 9n + 7n;

    let totalSumOfElements = 0n;
    let sumOfSquaredElements = 0n;

    seriesOfBigIntegers.forEach(currentElement => {
        totalSumOfElements += currentElement;
        sumOfSquaredElements += currentElement * currentElement;
    });

    const squareOfTotalSum = totalSumOfElements * totalSumOfElements;
    const differenceOfSums = squareOfTotalSum - sumOfSquaredElements;
    const ultimateResultBeforeModulo = differenceOfSums / 2n;

    const finalModulatedValue = ultimateResultBeforeModulo % CONSTANT_MODIFIER;

    console.log(finalModulatedValue.toString());
}

ProcessNumericalSeries(require("fs").readFileSync("/dev/stdin", "utf8"));