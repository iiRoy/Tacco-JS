const obtainMaximum = (collectionOfValues) => {
    if (collectionOfValues.length === 0) {
        return -Infinity;
    }
    if (collectionOfValues.length === 1) {
        return collectionOfValues[0];
    }
    const [headElement, ...tailElements] = collectionOfValues;
    const maxFromRemaining = obtainMaximum(tailElements);
    return headElement > maxFromRemaining ? headElement : maxFromRemaining;
};

const processNumericalSequence = (inputDatum) => {
    const extractedTokens = inputDatum.match(/-?\d+/g);
    const firstOperand = Number(extractedTokens[0]);
    const secondOperand = Number(extractedTokens[1]);

    const calculationOutcomes = [
        firstOperand + secondOperand,
        firstOperand - secondOperand,
        firstOperand * secondOperand
    ];

    const ultimateValue = obtainMaximum(calculationOutcomes);

    const finalOutputCandidate = Object.is(ultimateValue, -0) ? 0 : ultimateValue;

    console.log(finalOutputCandidate);
};

processNumericalSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));