const inputHandler = require('readline');

const streamReader = inputHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const evaluateCriterion = (itemValue) => {
    const textualRepresentation = itemValue.toString();

    // Condition 1: Check if the number is divisible by three
    const conditionAlpha = (itemValue % 3 === 0);

    // Condition 2: Check if the last digit is three
    const conditionBeta = (textualRepresentation[textualRepresentation.length - 1] === '3');
    
    // Condition 3: Check if the tens digit is three AND the number is a multiple of ten
    // (This covers cases like 30, 130, 230, etc.)
    let conditionGamma = false;
    if (itemValue >= 10 && itemValue % 10 === 0) {
        const quotientBase = Math.floor(itemValue / 10);
        if (quotientBase % 10 === 3) {
            conditionGamma = true;
        }
    }

    return conditionAlpha || conditionBeta || conditionGamma;
};

const generateAndSelectIterative = (maximumCount) => {
    const resultingCollection = [];
    let currentNumber = 1;
    while (currentNumber <= maximumCount) {
        if (evaluateCriterion(currentNumber)) {
            resultingCollection.push(currentNumber);
        }
        currentNumber++;
    }
    return resultingCollection;
};

streamReader.on('line', (dataLine) => {
    const numericInput = Number.parseInt(dataLine.trim(), 10);

    const qualifyingNumbers = generateAndSelectIterative(numericInput);
    const outputContent = qualifyingNumbers.join(' ');

    if (outputContent.length > 0) {
        process.stdout.write(' ' + outputContent + '\n');
    } else {
        process.stdout.write('\n');
    }
    streamReader.close();
});