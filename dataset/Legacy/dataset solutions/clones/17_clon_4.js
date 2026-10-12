const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = fileContent.split('\n');

const formatNumericOutput = (valueToFormat) => {
    const scaledValue = Math.round(valueToFormat * 1000);
    const isNegative = scaledValue < 0;
    const absoluteScaledValue = Math.abs(scaledValue);
    let stringRepresentation = String(absoluteScaledValue);

    while (stringRepresentation.length < 3) {
        stringRepresentation = '0' + stringRepresentation;
    }

    const decimalPart = stringRepresentation.slice(-3);
    let integerPart = stringRepresentation.slice(0, -3);

    if (integerPart === '') {
        integerPart = '0';
    }

    return (isNegative ? '-' : '') + integerPart + '.' + decimalPart;
};

for (const currentInputRow of dataRows) {
    if (!currentInputRow.trim()) {
        continue;
    }

    const numericValues = currentInputRow.split(' ').map(Number);

    const coeffA = numericValues[0];
    const coeffB = numericValues[1];
    const constC = numericValues[2];
    const coeffD = numericValues[3];
    const coeffE = numericValues[4];
    const constF = numericValues[5];

    // Solving the system of linear equations using Cramer's Rule:
    // coeffA * x + coeffB * y = constC
    // coeffD * x + coeffE * y = constF

    const determinantMain = (coeffA * coeffE) - (coeffB * coeffD);
    const determinantX = (constC * coeffE) - (coeffB * constF);
    const determinantY = (coeffA * constF) - (constC * coeffD);

    const solutionX = determinantX / determinantMain;
    const solutionY = determinantY / determinantMain;

    const formattedX = formatNumericOutput(solutionX);
    const formattedY = formatNumericOutput(solutionY);

    console.log(formattedX + ' ' + formattedY);
}
