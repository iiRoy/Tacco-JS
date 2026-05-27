function Main(inputData) {
    const [ , dataElementsString ] = inputData.split("\n");

    const MODULUS_VALUE = BigInt(10 ** 9 + 7);

    const { totalSumOfValues, sumOfSquaredValues } = dataElementsString.split(' ').reduce(
        (accumulator, currentStringValue) => {
            const currentValue = BigInt(currentStringValue);
            accumulator.totalSumOfValues += currentValue;
            accumulator.sumOfSquaredValues += currentValue * currentValue;
            return accumulator;
        },
        { totalSumOfValues: 0n, sumOfSquaredValues: 0n }
    );

    const sumOfAllProducts = (totalSumOfValues * totalSumOfValues - sumOfSquaredValues) / 2n;

    const finalComputedValue = sumOfAllProducts % MODULUS_VALUE;

    console.log(finalComputedValue.toString());
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
