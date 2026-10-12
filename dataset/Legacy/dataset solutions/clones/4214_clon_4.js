function determineDigitFrequency(sourceText) {
    const digitOccurrences = sourceText.split('').reduce((accumulator, currentCharacter) => {
        const numericValue = Number(currentCharacter);
        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 9) {
            accumulator[currentCharacter] = (accumulator[currentCharacter] || 0) + 1;
        }
        return accumulator;
    }, {});

    const result = Object.values(digitOccurrences).some(count => count > 2);
    return result ? 'Yes' : 'No';
}

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(determineDigitFrequency(sourceData));
