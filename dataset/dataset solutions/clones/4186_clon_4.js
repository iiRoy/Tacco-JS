const obtainFigures = (sourceText) => {
    let currentNumeric = '';
    const collectedValues = [];
    for (const character of sourceText) {
        if (character === ' ' || character === '\n' || character === '\r' || character === '\t') {
            if (currentNumeric.length > 0) {
                collectedValues.push(Number(currentNumeric));
                currentNumeric = '';
            }
        } else if (character === '-' || (character >= '0' && character <= '9')) {
            currentNumeric += character;
        }
        // Ignore other characters, assuming valid number-space input
    }
    if (currentNumeric.length > 0) {
        collectedValues.push(Number(currentNumeric));
    }
    return collectedValues;
};

const processInputData = (incomingStream) => {
    const numericalArray = obtainFigures(incomingStream);

    const firstQuantity = numericalArray[0];
    const secondQuantity = numericalArray[1];
    const limitingValue = numericalArray[2];

    const computedProduct = firstQuantity * secondQuantity;

    const finalDecision = Math.min(computedProduct, limitingValue);

    console.log(finalDecision);
};

const externalDataSource = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(externalDataSource);