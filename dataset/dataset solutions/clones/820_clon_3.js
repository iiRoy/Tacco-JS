const calculatePowerOfTen = (exponentValue) => {
    return Math.pow(10, Math.floor(exponentValue));
};

const totalTestCases = Math.floor(readline());

for (let currentCaseIndex = 0; currentCaseIndex < totalTestCases; ++currentCaseIndex) {
    const foundPairs = [];

    const currentInputLine = readline();
    const inputDimensions = currentInputLine.split(' ');

    const lengthForA = Math.floor(inputDimensions[0]);
    const lengthForB = Math.floor(inputDimensions[1]);

    const lowerBoundA = calculatePowerOfTen(lengthForA - 1);
    const upperBoundAExclusive = calculatePowerOfTen(lengthForA);

    const lowerBoundB = calculatePowerOfTen(lengthForB - 1);
    const upperBoundBExclusive = calculatePowerOfTen(lengthForB);

    for (let valueA = lowerBoundA; valueA < upperBoundAExclusive - 1; ++valueA) {
        for (let valueB = lowerBoundB; valueB < upperBoundBExclusive - 1; ++valueB) {
            const sumOfAAndB = valueA + valueB;
            const countOfTerms = valueB - valueA + 1;
            const arithmeticSumResult = (sumOfAAndB * countOfTerms) / 2;

            const concatenatedStringAB = String(valueA) + String(valueB);

            if (String(arithmeticSumResult) === concatenatedStringAB) {
                foundPairs.push(valueA + ' ' + valueB);
            }
        }
    }

    if (foundPairs.length > 0) {
        foundPairs.forEach(pairString => print(pairString));
    } else {
        print('No cats.');
    }
}
