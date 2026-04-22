const fileSystem = require('fs');

const parseNumericValue = (strValue, defaultValue = 0) => {
    const parsed = parseInt(strValue, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

try {
    const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

    if (!rawInputData || rawInputData.trim() === '') {
        console.error("Error: No input data received.");
        process.exit(1);
    }

    const inputLines = rawInputData.split('\n');

    const firstLineContent = inputLines.shift();
    if (!firstLineContent) {
        console.error("Error: First line of input missing.");
        process.exit(1);
    }
    const parameterTokens = firstLineContent.split(' ');

    const sequenceTotalLength = parseNumericValue(parameterTokens[0]);

    const maxPermittedOperations = parseNumericValue(parameterTokens[1]);

    const characterString = inputLines.shift();
    if (!characterString) {
        console.error("Error: Character sequence input missing.");
        process.exit(1);
    }

    let transitionCounter = 0;

    if (sequenceTotalLength < 1) {
        console.log(0);
        process.exit(0);
    }
    if (sequenceTotalLength === 1) {
        console.log(0);
        process.exit(0);
    }

    let lastProcessedChar = characterString[0];

    for (let charIndex = 1; charIndex < sequenceTotalLength; charIndex++) {
        const currentChar = characterString[charIndex];
        if (lastProcessedChar !== currentChar) {
            transitionCounter++;
            lastProcessedChar = currentChar;
        }
    }

    const potentialTransitionsEliminated = 2 * maxPermittedOperations;

    const remainingUnfixedTransitions = Math.max(0, transitionCounter - potentialTransitionsEliminated);

    const totalAdjacentPairs = sequenceTotalLength - 1;

    const finalIdenticalPairs = totalAdjacentPairs - remainingUnfixedTransitions;

    console.log(finalIdenticalPairs);

} catch (processingError) {
    console.error("An error occurred during program execution:", processingError.message);
    process.exit(1);
}