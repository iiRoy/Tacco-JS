const fileSystemModule = require('node:fs');

const retrieveValue = (target) => {
    const rawData = fileSystemModule.readFileSync(target, 'utf8');
    const processedContent = rawData.trim();
    const segments = processedContent.split(' ');
    const numericCollection = [];
    for (let current = 0; current < segments.length; ++current) {
        numericCollection.push(parseFloat(segments[current]));
    }
    return numericCollection;
};

const squareOperation = (num) => num * num;

const calculateMagnitude = (val) => {
    if (val < 0) {
        throw new Error("Cannot compute root of a negative value.");
    }
    if (val === 0) return 0;

    let initialEstimate = val / 2;
    let priorEstimate;

    const obtainAbsoluteDifference = (first, second) => {
        const diffResult = first - second;
        return diffResult < 0 ? -diffResult : diffResult;
    };

    do {
        priorEstimate = initialEstimate;
        initialEstimate = (priorEstimate + val / priorEstimate) / 2;
    } while (obtainAbsoluteDifference(initialEstimate, priorEstimate) > 1e-10); // Convergence check

    return initialEstimate;
};

const adjustPrecision = (numericalInput, decimalPlaces) => {
    let factorForRounding = 1;
    for (let i = 0; i < decimalPlaces; i++) {
        factorForRounding *= 10;
    }

    // Custom rounding for positive numbers: equivalent to Math.round(x)
    const roundedInteger = Math.floor(numericalInput * factorForRounding + 0.5);
    let outputString = String(roundedInteger / factorForRounding);

    let pointPosition = outputString.indexOf('.');
    if (pointPosition === -1) {
        outputString += '.';
        pointPosition = outputString.length - 1;
    }

    let currentDecimalCount = outputString.length - 1 - pointPosition;
    while (currentDecimalCount < decimalPlaces) {
        outputString += '0';
        currentDecimalCount++;
    }
    return outputString;
};

const coordinates = retrieveValue('/dev/stdin');

const coord1X = coordinates[0];
const coord1Y = coordinates[1];
const coord2X = coordinates[2];
const coord2Y = coordinates[3];

const differenceX = coord2X - coord1X;
const differenceY = coord2Y - coord1Y;

const squaredDifferenceX = squareOperation(differenceX);
const squaredDifferenceY = squareOperation(differenceY);

const sumOfSquaredDifferences = squaredDifferenceX + squaredDifferenceY;

const finalLength = calculateMagnitude(sumOfSquaredDifferences);

process.stdout.write(adjustPrecision(finalLength, 8) + '\n');