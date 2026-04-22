const extractNumericalUnits = (sourceText) => {
    let currentNumericalString = '';
    const resultantCollection = [];
    for (let currentCharacter of sourceText) {
        if (currentCharacter >= '0' && currentCharacter <= '9') {
            currentNumericalString += currentCharacter;
        } else {
            if (currentNumericalString.length > 0) {
                resultantCollection.push(Number(currentNumericalString));
                currentNumericalString = '';
            }
        }
    }
    if (currentNumericalString.length > 0) {
        resultantCollection.push(Number(currentNumericalString));
    }
    return resultantCollection;
};

const adjustOperand = (val) => val + 1;
const computeDifference = (minuend, subtrahend) => minuend - subtrahend;
const performMultiplication = (factor1, factor2) => factor1 * factor2;

let accumulatedInput = '';

process.stdin.on('data', (chunk) => {
    accumulatedInput += chunk.toString();
});

process.stdin.on('end', () => {
    const parsedData = extractNumericalUnits(accumulatedInput.trim());

    const initialValue = parsedData[0];
    const operandB = parsedData[1];
    const operandC = parsedData[2];

    const adjustedInitial = adjustOperand(initialValue);
    const termOne = computeDifference(adjustedInitial, operandB);
    const termTwo = computeDifference(adjustedInitial, operandC);

    const finalOutcome = performMultiplication(termOne, termTwo);

    process.stdout.write(String(finalOutcome) + '\n');
});