const circleConstant = Math.acos(-1);

const doubleFactor = Math.sqrt(4);

function calculateSquare(valueForSquare) {
    return valueForSquare * valueForSquare;
}

function prettyPrint(numericValue, desiredPlaces) {
    const scaleFactor = Math.pow(10, desiredPlaces);
    let absValue = Math.abs(numericValue);
    let scaledAndRounded = Math.round(absValue * scaleFactor);

    let integerSection = Math.floor(scaledAndRounded / scaleFactor);
    let fractionalSection = scaledAndRounded % scaleFactor;

    let fractionalString = String(fractionalSection);
    while (fractionalString.length < desiredPlaces) {
        fractionalString = "0" + fractionalString;
    }

    let finalFormatted = `${integerSection}.${fractionalString}`;

    if (numericValue < 0) {
        finalFormatted = "-" + finalFormatted;
    } else if (numericValue === 0 && (1 / numericValue) === -Infinity) {
        finalFormatted = "0.000000";
    }

    return finalFormatted;
}

let accumulatedInput = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (pieceOfData) => {
    accumulatedInput += pieceOfData;
});

process.stdin.on('end', () => {
    const numericParameter = parseFloat(accumulatedInput.trim());

    const surfaceExtent = circleConstant * calculateSquare(numericParameter);

    const boundaryLength = doubleFactor * circleConstant * numericParameter;

    const formattedExtent = prettyPrint(surfaceExtent, 6);
    const formattedBoundary = prettyPrint(boundaryLength, 6);

    process.stdout.write(formattedExtent + ' ' + formattedBoundary + '\n');
});