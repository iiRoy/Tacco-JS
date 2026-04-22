const fileSystemInterface = require('node:fs');

const calculateAdjustedRoot = (originalNumber) => {
    const squareAndScale = (input) => Math.sqrt(input) * 10;
    const roundAndDivide = (scaledValue) => Math.round(scaledValue) / 10;
    return roundAndDivide(squareAndScale(originalNumber));
};

const extractFirstThreeDigits = (textualSource) => {
    const firstLineContent = textualSource.includes('\n') ? textualSource.substring(0, textualSource.indexOf('\n')) : textualSource;
    const digitSequences = [...firstLineContent.matchAll(/\d+/g)].map(match => parseInt(match[0], 10));

    if (digitSequences.length < 3) {
        throw new Error("Insufficient numerical components found.");
    }
    return digitSequences.slice(0, 3);
};

const determineComparisonOutcome = (numberSet) => {
    const [valueOne, valueTwo, valueThree] = numberSet;

    const modifiedOne = calculateAdjustedRoot(valueOne);
    const modifiedTwo = calculateAdjustedRoot(valueTwo);
    const modifiedThree = calculateAdjustedRoot(valueThree);

    const decisionDisplay = new Map([
        [true, 'Yes'],
        [false, 'No']
    ]);

    const comparisonHolds = (modifiedOne + modifiedTwo) < modifiedThree;
    return decisionDisplay.get(comparisonHolds);
};

(async () => {
    const standardInputLocator = '/dev/stdin';
    const characterEncoding = 'utf8';

    try {
        const sourceData = await fileSystemInterface.promises.readFile(standardInputLocator, characterEncoding);
        const initialNumbers = extractFirstThreeDigits(sourceData);
        const finalJudgment = determineComparisonOutcome(initialNumbers);
        process.stdout.write(finalJudgment + '\n');
    } catch (operationError) {
        process.stderr.write(`Execution failure: ${operationError.message}\n`);
        process.exit(1);
    }
})();