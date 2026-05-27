function processInputAndCount(rawInputString) {
    const numericStrings = rawInputString.split(' ');
    const lowerBoundary = parseInt(numericStrings[0], 10);
    const upperBoundary = parseInt(numericStrings[1], 10);

    let foundCount = 0;

    function* generateFiveDigitPalindromes() {
        for (let outerDigit = 1; outerDigit <= 9; outerDigit++) {
            for (let innerDigitA = 0; innerDigitA <= 9; innerDigitA++) {
                for (let innerDigitB = 0; innerDigitB <= 9; innerDigitB++) {
                    const constructedString = `${outerDigit}${innerDigitA}${innerDigitB}${innerDigitA}${outerDigit}`;
                    yield parseInt(constructedString, 10);
                }
            }
        }
    }

    for (const currentPalindromeCandidate of generateFiveDigitPalindromes()) {
        if (currentPalindromeCandidate >= lowerBoundary && currentPalindromeCandidate <= upperBoundary) {
            foundCount++;
        }
    }

    console.log(foundCount);
}

processInputAndCount(require('fs').readFileSync('/dev/stdin', 'utf8'));
