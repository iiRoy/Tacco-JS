const extractIntegerPart = (value) => Math.floor(value);
const determineMaximum = (valA, valB) => Math.max(valA, valB);
const computeValuation = (baseFigure, rateModifier) =>
  extractIntegerPart(baseFigure * (100 + rateModifier) / 100);
const convertToInteger = (textualRepresentation) => parseInt(textualRepresentation, 10);
const reportOutcome = (value) => process.stdout.write(value + '\n');

const discoverMatchingSecondComponent = (desiredCostForSecond, modifierA, upperLimit) => {
    for (let currentSecond = 1; currentSecond < upperLimit; ++currentSecond) {
        const currentSecondValuation = computeValuation(currentSecond, modifierA);
        if (currentSecondValuation === desiredCostForSecond) {
            return currentSecond;
        }
        if (currentSecondValuation > desiredCostForSecond) {
            return null;
        }
    }
    return null;
};

const processInputSequentially = (remainingDataLines) => {
    if (remainingDataLines.length === 0) {
        return;
    }

    const currentDataLine = remainingDataLines[0];
    const numericParameters = currentDataLine.split(" ").map(convertToInteger);
    const modifierAlpha = numericParameters[0];
    const modifierBeta = numericParameters[1];
    const ultimateTarget = numericParameters[2];

    if (modifierAlpha === 0 && modifierBeta === 0 && ultimateTarget === 0) {
        return;
    }

    let greatestAccumulatedValue = 0;

    for (let firstComponent = 1; firstComponent < ultimateTarget; ++firstComponent) {
        const costOfFirstComponentAlpha = computeValuation(firstComponent, modifierAlpha);
        const requiredCostForSecond = ultimateTarget - costOfFirstComponentAlpha;

        if (requiredCostForSecond <= 0) {
            continue;
        }

        const secondComponent = discoverMatchingSecondComponent(requiredCostForSecond, modifierAlpha, ultimateTarget);

        if (secondComponent !== null) {
            const costOfFirstComponentBeta = computeValuation(firstComponent, modifierBeta);
            const costOfSecondComponentBeta = computeValuation(secondComponent, modifierBeta);
            const currentTotalBeta = costOfFirstComponentBeta + costOfSecondComponentBeta;
            greatestAccumulatedValue = determineMaximum(greatestAccumulatedValue, currentTotalBeta);
        }
    }

    reportOutcome(greatestAccumulatedValue);
    processInputSequentially(remainingDataLines.slice(1));
};

const fileSystemAccessModule = require('fs');
const rawInputContent = fileSystemAccessModule.readFileSync('/dev/stdin', 'utf8');
const preparedInputLines = rawInputContent.trim().split("\n");

processInputSequentially(preparedInputLines);