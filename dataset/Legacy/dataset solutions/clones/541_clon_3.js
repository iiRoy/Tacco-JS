const inputOutputHandler = require('readline');

const streamProcessor = inputOutputHandler.createInterface({
    input: process.stdin,
    output: process.stdout
});

streamProcessor.question('', (inputLineContent) => {
    const inputDelimiter = " ";
    const stringParts = inputLineContent.split(inputDelimiter);

    const firstOperandString = stringParts[0];
    const firstNumericValue = parseInt(firstOperandString, 10);

    const secondOperandString = stringParts[1];
    const secondNumericValue = parseInt(secondOperandString, 10);

    const rawDivisionResult = secondNumericValue / firstNumericValue;
    const floorDivisionResult = Math.floor(rawDivisionResult);

    const finalComputedValue = floorDivisionResult + 1;

    console.log(finalComputedValue);

    streamProcessor.close();
});
