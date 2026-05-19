function entryPoint(rawInput) {
    const inputLines = rawInput.split('\n');
    const [gridHeight, gridWidth] = inputLines[0].split(' ').map(Number);

    if (gridWidth === 1) {
        return console.log('Yes');
    }

    const characterFrequencies = new Map();
    for (let lineIndex = 1; lineIndex < inputLines.length; ++lineIndex) {
        const currentLine = inputLines[lineIndex];
        for (let charIndex = 0; charIndex < currentLine.length; ++charIndex) {
            const char = currentLine[charIndex];
            characterFrequencies.set(char, (characterFrequencies.get(char) || 0) + 1);
        }
    }

    let sumOfCountsNotDivisibleByFour = 0;
    let countOfCountsNotDivisibleByFour = 0;

    for (const countValue of characterFrequencies.values()) {
        if (countValue % 4 !== 0) {
            sumOfCountsNotDivisibleByFour += countValue;
            countOfCountsNotDivisibleByFour++;
        }
    }

    const isHeightOdd = (gridHeight % 2) !== 0;
    const isWidthOdd = (gridWidth % 2) !== 0;

    let finalDecision;

    if (!isHeightOdd && !isWidthOdd) { // Both dimensions are even
        finalDecision = (countOfCountsNotDivisibleByFour === 0);
    } else if (isHeightOdd && isWidthOdd) { // Both dimensions are odd
        finalDecision = (sumOfCountsNotDivisibleByFour % 2) === 1;
    } else { // One dimension is even, the other is odd
        finalDecision = (sumOfCountsNotDivisibleByFour === 0);
    }

    console.log(finalDecision ? 'Yes' : 'No');
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
