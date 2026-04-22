function processInputData(rawData) {
    const extractedValues = rawData.match(/\d+/g);
    const firstOperand = Number(extractedValues[0]);
    const secondOperand = Number(extractedValues[1]);

    const isFirstOdd = (firstOperand & 1) === 1;
    const isSecondOdd = (secondOperand & 1) === 1;

    const finalParityFlag = isFirstOdd && isSecondOdd;

    const resultDisplay = ['Even', 'Odd'];

    console.log(resultDisplay[+finalParityFlag]);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));