'use strict';

const getStandardInputContent = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const processRawInputString = (rawInputData) => {
    const cleanedInput = rawInputData.trim();
    const stringSegments = cleanedInput.split(' ');
    const numericData = stringSegments.map(segment => Number(segment));
    return numericData;
};

function calculateValidTriplets(inputDataString) {
    const processedNumericValues = processRawInputString(inputDataString);

    const upperLimitForComponents = processedNumericValues[0];
    const targetSumValue = processedNumericValues[1];

    let totalValidCombinations = 0;

    const lowerBound = 0;
    const upperBound = upperLimitForComponents;

    for (let firstComponent = lowerBound; firstComponent <= upperBound; firstComponent++) {
        for (let secondComponent = lowerBound; secondComponent <= upperBound; secondComponent++) {
            const sumOfFirstTwo = firstComponent + secondComponent;
            const requiredThirdComponent = targetSumValue - sumOfFirstTwo;

            const isThirdComponentNonNegative = requiredThirdComponent >= lowerBound;
            const isThirdComponentWithinLimit = requiredThirdComponent <= upperBound;

            if (isThirdComponentNonNegative && isThirdComponentWithinLimit) {
                totalValidCombinations++;
            }
        }
    }

    console.log(totalValidCombinations);
}

calculateValidTriplets(getStandardInputContent());
