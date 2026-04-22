const calculateOutcome = (initialValue, subsequentValue) => {
    let intermediateResult = subsequentValue;
    intermediateResult = intermediateResult + subsequentValue;
    return intermediateResult - initialValue;
};

const decipherNumericData = (rawData) => {
    const digitSequences = rawData.match(/\b\d+\b/g);

    if (!digitSequences || digitSequences.length < 2) {
        throw new Error("Insufficient numerical input for processing.");
    }

    const primaryFigure = Number(digitSequences[0]);
    const secondaryFigure = Number(digitSequences[1]);

    return { first: primaryFigure, second: secondaryFigure };
};

let accumulatedContent = '';

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    let piece;
    while ((piece = process.stdin.read()) !== null) {
        accumulatedContent += piece;
    }
});

process.stdin.on('end', () => {
    try {
        const { first, second } = decipherNumericData(accumulatedContent);
        const finalOutput = calculateOutcome(first, second);
        process.stdout.write(String(finalOutput) + '\n');
    } catch (operationIssue) {
        process.stderr.write(`Problem Encountered: ${operationIssue.message}\n`);
        process.exit(1);
    }
});