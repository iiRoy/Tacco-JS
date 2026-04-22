const fileSystemModule = require("fs");

const rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const numericalValueTokens = rawInputData.split(/\s+/).filter(Boolean);

const sequenceLength = Number(numericalValueTokens[0]);

let validProductPairCounter = 0;

const hasDecimalPoint = (valueString) => valueString.includes('.');

const getFractionalPart = (valueString) => {
    const parts = valueString.split('.');
    return parts.length > 1 ? parts[1] : '';
};

const getDecimalPlaceCount = (valueString) => {
    const dotPosition = valueString.indexOf('.');
    return dotPosition === -1 ? 0 : valueString.length - dotPosition - 1;
};

for (let outerLoopIndex = 1; outerLoopIndex <= sequenceLength; ++outerLoopIndex) {
    for (let innerLoopIndex = 1; innerLoopIndex < outerLoopIndex; ++innerLoopIndex) {
        const currentElementStr = numericalValueTokens[innerLoopIndex];
        const comparisonElementStr = numericalValueTokens[outerLoopIndex];

        const isCurrentFractional = hasDecimalPoint(currentElementStr);
        const isComparisonFractional = hasDecimalPoint(comparisonElementStr);

        let isProductAnInteger = false;

        if (!isCurrentFractional && !isComparisonFractional) {
            isProductAnInteger = true;
        } else if (isCurrentFractional && !isComparisonFractional) {
            const currentFractionalPart = getFractionalPart(currentElementStr);
            const currentDecimalDigits = getDecimalPlaceCount(currentElementStr);
            const comparisonValue = Number(comparisonElementStr);

            const intermediateCalcResult = Number(currentFractionalPart) * comparisonValue;
            const intermediateResultString = String(intermediateCalcResult);

            if (Number(intermediateResultString.slice(-currentDecimalDigits)) === 0) {
                isProductAnInteger = true;
            }
        } else if (!isCurrentFractional && isComparisonFractional) {
            const comparisonFractionalPart = getFractionalPart(comparisonElementStr);
            const comparisonDecimalDigits = getDecimalPlaceCount(comparisonElementStr);
            const currentNumberValue = Number(currentElementStr);

            const intermediateCalcResult = Number(comparisonFractionalPart) * currentNumberValue;
            const intermediateResultString = String(intermediateCalcResult);

            if (Number(intermediateResultString.slice(-comparisonDecimalDigits)) === 0) {
                isProductAnInteger = true;
            }
        }

        if (isProductAnInteger) {
            validProductPairCounter++;
        }
    }
}

console.log(validProductPairCounter);