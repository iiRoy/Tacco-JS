function processInputData(inputTxt) {
    const inputLines = inputTxt.trim().split('\n');
    const dimensionStrings = inputLines[0].split(' ');

    const extractParameters = (strArr) => {
        const numA = BigInt(strArr[0]);
        const numB = BigInt(strArr[1]);
        return [numA, numB];
    };

    const [alpha, beta] = extractParameters(dimensionStrings);

    const moduloValue = 1000000007n;

    const sumUpTo = (val) => {
        if (val < 0n) return 0n;
        return val * (val + 1n) / 2n;
    };

    const sumSquaresUpTo = (val) => {
        if (val < 0n) return 0n;
        return val * (val + 1n) * (2n * val + 1n) / 6n;
    };

    const lowerBound = beta;
    const upperBound = alpha + 1n;

    const sumOfIndices = sumUpTo(upperBound) - sumUpTo(lowerBound - 1n);

    const sumOfSquares = sumSquaresUpTo(upperBound) - sumSquaresUpTo(lowerBound - 1n);

    const countOfTerms = upperBound - lowerBound + 1n;

    let finalAccumulation = (alpha + 1n) * sumOfIndices - sumOfSquares + countOfTerms;

    finalAccumulation = (finalAccumulation % moduloValue + moduloValue) % moduloValue;

    console.log(finalAccumulation.toString());
}

const readInputString = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

processInputData(readInputString());