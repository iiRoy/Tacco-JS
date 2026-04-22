const filesystemAccess = require('fs');

function calculateSquared(operand) {
    return operand * operand;
}

function produceFormattedNumber(valueToFormat) {
    const precisionMultiplier = 1000000; // For 6 decimal places (10^6)
    let roundedValue = Math.round(valueToFormat * precisionMultiplier);
    let stringRepresentation = String(roundedValue);

    // Pad with leading zeros if the number is very small (e.g., 0.000001)
    // We need at least 7 digits to represent "0.000000" correctly after splitting
    while (stringRepresentation.length < 7) {
        stringRepresentation = '0' + stringRepresentation;
    }

    // Insert the decimal point 6 characters from the end
    let finalFormatted = stringRepresentation.slice(0, -6) + '.' + stringRepresentation.slice(-6);
    return finalFormatted;
}

(function entryPoint() {
    const rawInputContent = filesystemAccess.readFileSync(0, 'utf8').trim();
    const coordinateStrings = rawInputContent.split(' ');

    const pointOneX = Number(coordinateStrings[0]);
    const pointOneY = Number(coordinateStrings[1]);
    const pointTwoX = Number(coordinateStrings[2]);
    const pointTwoY = Number(coordinateStrings[3]);

    const deltaXValue = pointOneX - pointTwoX;
    const deltaYValue = pointOneY - pointTwoY;

    const squaredDeltaX = calculateSquared(deltaXValue);
    const squaredDeltaY = calculateSquared(deltaYValue);

    const sumOfSquaresComponents = squaredDeltaX + squaredDeltaY;
    const finalMagnitude = Math.sqrt(sumOfSquaresComponents);

    console.log(produceFormattedNumber(finalMagnitude));
})();