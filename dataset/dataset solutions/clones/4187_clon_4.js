const acquireSourceData = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const parseNumericalComponents = (textPayload) => {
    const extractedStrings = textPayload.trim().match(/-?\d+/g);
    if (!extractedStrings || extractedStrings.length < 3) {
        throw new Error("Insufficient numerical components in input.");
    }
    return extractedStrings.map(valueString => parseInt(valueString, 10));
};

const calculateProduct = (firstFactor, secondFactor) => {
    let resultAccumulator = 0;
    const isProductNegative = (firstFactor < 0 && secondFactor > 0) || (firstFactor > 0 && secondFactor < 0);
    const absFirst = firstFactor < 0 ? -firstFactor : firstFactor;
    const absSecond = secondFactor < 0 ? -secondFactor : secondFactor;

    for (let counter = 0; counter < absSecond; counter++) {
        resultAccumulator += absFirst;
    }
    return isProductNegative ? -resultAccumulator : resultAccumulator;
};

const determineSmallerValue = (comparisonOne, comparisonTwo) => {
    return comparisonOne < comparisonTwo ? comparisonOne : comparisonTwo;
};

const executeProgram = () => {
    const fullInputString = acquireSourceData();
    const [elementA, elementB, elementC] = parseNumericalComponents(fullInputString);

    const interimProduct = calculateProduct(elementA, elementB);
    const finalOutcome = determineSmallerValue(interimProduct, elementC);

    process.stdout.write(finalOutcome.toString() + '\n');
};

executeProgram();