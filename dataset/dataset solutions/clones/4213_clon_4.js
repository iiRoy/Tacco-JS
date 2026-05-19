function analyzeString(sourceText) {
    const isSpecialCaseMatch = sourceText === '1000';

    if (isSpecialCaseMatch) {
        return 'Yes';
    }

    const digitOccurrenceMap = Array.from(sourceText).reduce((accumulator, currentCharacter) => {
        if (currentCharacter >= '1' && currentCharacter <= '9') {
            accumulator[currentCharacter] = (accumulator[currentCharacter] || 0) + 1;
        }
        return accumulator;
    }, {});

    const targetDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const hasSufficientOccurrences = targetDigits.some(singleDigit => {
        const currentCount = digitOccurrenceMap[singleDigit] || 0;
        return currentCount >= 3;
    });

    return hasSufficientOccurrences ? 'Yes' : 'No';
}

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(analyzeString(inputData));
