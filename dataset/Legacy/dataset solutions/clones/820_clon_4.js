function* generateRange(startValue, endValue) {
    for (let currentNumber = startValue; currentNumber <= endValue; ++currentNumber) {
        yield currentNumber;
    }
}

const totalCases = Math.floor(globalThis.readline());

for (let caseIdentifier = 0; caseIdentifier < totalCases; ++caseIdentifier) {
    const [firstNumberDigits, secondNumberDigits] = globalThis.readline().split(' ').map(Number);

    const lowerBoundA = 10**(firstNumberDigits - 1);
    const upperBoundA = 10**firstNumberDigits - 1;
    const lowerBoundB = 10**(secondNumberDigits - 1);
    const upperBoundB = 10**secondNumberDigits - 1;

    const collectedPairs = [];

    for (const valueA of generateRange(lowerBoundA, upperBoundA)) {
        for (const valueB of generateRange(lowerBoundB, upperBoundB)) {
            const sumOfSequence = (valueA + valueB) * (valueB - valueA + 1) / 2;
            const combinedNumericValue = Number(`${valueA}${valueB}`);

            if (sumOfSequence === combinedNumericValue) {
                collectedPairs.push(`${valueA} ${valueB}`);
            }
        }
    }

    if (collectedPairs.length > 0) {
        collectedPairs.forEach(pairEntry => globalThis.print(pairEntry));
    } else {
        globalThis.print('No cats.');
    }
}
