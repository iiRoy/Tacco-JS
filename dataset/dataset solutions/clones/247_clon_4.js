const dataFeed = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const textRows = dataFeed.split('\n');

const obtainCoefficientRow = (rowIdentifier) => {
    let priorRowValues = [1];

    for (let r = 1; r <= rowIdentifier; ++r) {
        let currentRowValues = new Array(r + 1);
        currentRowValues[0] = 1;
        for (let k = 1; k < r; ++k) {
            currentRowValues[k] = (priorRowValues[k - 1] + priorRowValues[k]) % 10;
        }
        currentRowValues[r] = 1;
        priorRowValues = currentRowValues;
    }
    return priorRowValues;
};

for (let currentLineIndex = 0; currentLineIndex < textRows.length; ++currentLineIndex) {
    const currentEntry = textRows[currentLineIndex];
    if (currentEntry.trim() === '') continue;

    const numericalDigits = Array.from(currentEntry).map(Number);
    const digitCount = numericalDigits.length;

    if (digitCount === 0) {
        // Should not happen with valid input, but for robustness
        continue;
    }

    // The result is a weighted sum of digits with Pascal's triangle coefficients (N-1 row), modulo 10
    const combinationCoefficients = obtainCoefficientRow(digitCount - 1);

    let finalSumAccumulator = 0;
    for (let digitPosition = 0; digitPosition < digitCount; ++digitPosition) {
        finalSumAccumulator = (finalSumAccumulator + (combinationCoefficients[digitPosition] * numericalDigits[digitPosition])) % 10;
    }
    console.log(finalSumAccumulator);
}