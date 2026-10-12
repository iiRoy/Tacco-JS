const obtainRawInput = (sourceIdentifier) => {
    return require('fs').readFileSync(sourceIdentifier, 'utf8');
};

const NumericRangeSpecifier = (textualData) => {
    const linesOfText = textualData.trim().split('\n');
    const firstLineValues = linesOfText[0].split(' ').map(Number);
    return {
        lowerBound: firstLineValues[0],
        upperBound: firstLineValues[1]
    };
};

const evaluateProductModulo = (value, divisor) => {
    const termOneModulo = value % divisor;
    const termTwoModulo = (value + 1) % divisor;
    return (termOneModulo * termTwoModulo) % divisor;
};

const orchestrateMinModuloSearch = (inputInformation) => {
    const calculationDivisor = 2019;

    const { lowerBound: startPoint, upperBound: endPoint } = inputInformation;

    const firstMultipleInEffectiveRange = Math.ceil(startPoint / calculationDivisor) * calculationDivisor;
    if (firstMultipleInEffectiveRange < endPoint) {
        return 0;
    }

    let currentMinimumRemainder = evaluateProductModulo(startPoint, calculationDivisor);

    const iterationCeiling = Math.min(endPoint - 1, startPoint + calculationDivisor - 1);

    for (let currentIteration = startPoint + 1; currentIteration <= iterationCeiling; ++currentIteration) {
        const remainderForCurrent = evaluateProductModulo(currentIteration, calculationDivisor);
        if (remainderForCurrent < currentMinimumRemainder) {
            currentMinimumRemainder = remainderForCurrent;
        }
    }

    return currentMinimumRemainder;
};

const initiateProcessing = () => {
    const fileSourcePath = '/dev/stdin';
    const fileContent = obtainRawInput(fileSourcePath);
    const parsedRange = NumericRangeSpecifier(fileContent);
    const finalCalculatedValue = orchestrateMinModuloSearch(parsedRange);
    console.log(finalCalculatedValue.toString());
};

initiateProcessing();