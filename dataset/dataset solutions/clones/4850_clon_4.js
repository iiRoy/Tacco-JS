const formatDecimalPrecision = (numericValue, precisionDigits) => {
    if (!Number.isFinite(numericValue)) {
        return String(numericValue);
    }

    const isNegative = numericValue < 0;
    const absoluteValue = Math.abs(numericValue);

    let integerPartString = Math.floor(absoluteValue).toString();
    
    const scaleFactor = Math.pow(10, precisionDigits);
    let scaledFraction = Math.round((absoluteValue - Math.floor(absoluteValue)) * scaleFactor);

    if (scaledFraction >= scaleFactor) {
        integerPartString = (parseInt(integerPartString, 10) + 1).toString();
        scaledFraction = 0;
    }

    let fractionalPartString = scaledFraction.toString();
    while (fractionalPartString.length < precisionDigits) {
        fractionalPartString = '0' + fractionalPartString;
    }

    const sign = isNegative ? '-' : '';
    return `${sign}${integerPartString}.${fractionalPartString}`;
};

const executeComputation = (sourceText) => {
    const [firstNumericalValue, secondNumericalValue] = sourceText
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(Number);

    const calculatedProportion = (firstNumericalValue * secondNumericalValue) / (firstNumericalValue + secondNumericalValue);

    return formatDecimalPrecision(calculatedProportion, 10);
};

const displayResultString = (contentToDisplay) => {
    console.log(contentToDisplay);
};

const beginExecution = (inputSourceContent) => {
    const formattedResult = executeComputation(inputSourceContent);
    displayResultString(formattedResult);
};