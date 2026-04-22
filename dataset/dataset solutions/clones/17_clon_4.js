const fileSystemUtility = require('fs');
const completeInputContent = fileSystemUtility.readFileSync(process.stdin.fd, 'utf8');
const contentSegments = completeInputContent.trim().split('\n');

const valueFormatter = (numericQuantity) => {
    let scaledAndRounded = Math.round(numericQuantity * 1000);
    let stringRepresentation = scaledAndRounded.toString();
    return stringRepresentation.replace(/(\d{3})$/, '.$1');
};

contentSegments.forEach(dataLine => {
    if (!dataLine) return;

    const parsedNumbers = dataLine.split(' ').map(Number);

    const coefficientA = parsedNumbers[0];
    const coefficientB = parsedNumbers[1];
    const constantC = parsedNumbers[2];
    const coefficientD = parsedNumbers[3];
    const coefficientE = parsedNumbers[4];
    const constantF = parsedNumbers[5];

    const mainDeterminant = (coefficientA * coefficientE) - (coefficientB * coefficientD);
    const determinantForX = (constantC * coefficientE) - (coefficientB * constantF);
    const determinantForY = (coefficientA * constantF) - (constantC * coefficientD);

    const unknownX = determinantForX / mainDeterminant;
    const unknownY = determinantForY / mainDeterminant;

    const formattedXOutput = valueFormatter(unknownX);
    const formattedYOutput = valueFormatter(unknownY);

    console.log(`${formattedXOutput} ${formattedYOutput}`);
});