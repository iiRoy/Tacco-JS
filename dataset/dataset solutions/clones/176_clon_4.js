function* generateIndexCombinations(dimensions) {
    if (dimensions.length === 0) {
        yield [];
        return;
    }
    const [currentDimensionSize, ...remainingDimensions] = dimensions;
    for (let i = 0; i < currentDimensionSize; i++) {
        for (const restOfIndices of generateIndexCombinations(remainingDimensions)) {
            yield [i, ...restOfIndices];
        }
    }
}

function createPatternSet() {
    const sourceA = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(",");
    const sourceB = "11,22,33,44,55,66,77,88,99".split(",");

    const patternStore = new Set();

    const dimensions = [sourceA.length, sourceA.length, sourceA.length, sourceA.length, sourceB.length];

    for (const indices of generateIndexCombinations(dimensions)) {
        const [idx1, idx2, idx3, idx4, idx5] = indices;
        const combinedString = sourceA[idx1] + sourceA[idx2] + sourceA[idx3] + sourceA[idx4] + sourceB[idx5];
        const sortedDigits = combinedString
            .split("")
            .map(Number)
            .sort((x, y) => x - y)
            .join("");
        patternStore.add(sortedDigits);
    }
    return patternStore;
}

const validPatterns = createPatternSet();
const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");

let lineCursor = 0;
while (lineCursor < inputLines.length) {
    const currentLine = inputLines[lineCursor++];
    
    const possibleAppends = Array.from({ length: 9 }, (_, digitValue) => digitValue);

    const validAppendedDigits = possibleAppends.filter(appendDigit => {
        const baseDigits = currentLine.split("").map(Number);
        const combinedDigits = [...baseDigits, appendDigit];
        combinedDigits.sort((x, y) => x - y);

        const digitFrequencies = combinedDigits.reduce((counts, digit) => {
            counts[digit] = (counts[digit] || 0) + 1;
            return counts;
        }, Array(10).fill(0));

        const maxFrequency = Math.max(...digitFrequencies);

        if (maxFrequency >= 5) {
            return false;
        }

        return validPatterns.has(combinedDigits.join(""));
    });

    console.log(validAppendedDigits.length === 0 ? "0" : validAppendedDigits.join(" "));
}
