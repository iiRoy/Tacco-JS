function determineSharedIntervalMetric(initialPointA, terminalPointB, initialPointC, terminalPointD) {
    const intersectionStart = Math.max(initialPointA, initialPointC);
    const intersectionEnd = Math.min(terminalPointB, terminalPointD);

    const rawOverlapLength = (intersectionStart <= intersectionEnd)
        ? (intersectionEnd - intersectionStart + 1)
        : 0;

    return Math.max(rawOverlapLength - 1, 0);
}

let inputBuffer = '';
process.stdin.on('data', fragment => {
    inputBuffer += fragment.toString();
});

process.stdin.on('end', () => {
    const parsedNumericalStrings = inputBuffer.trim().split(/\s+/);
    const numericalValues = parsedNumericalStrings.map(Number);

    if (numericalValues.length < 4 || numericalValues.some(Number.isNaN)) {
        console.error("Required: Four valid numeric inputs.");
        process.exit(1);
    }

    const [firstOrigin, firstLimit, secondOrigin, secondLimit] = numericalValues;

    const finalOutcome = determineSharedIntervalMetric(
        firstOrigin,
        firstLimit,
        secondOrigin,
        secondLimit
    );

    console.log(finalOutcome);
});