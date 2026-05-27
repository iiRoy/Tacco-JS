'use strict';

const processInputData = (sourceText) => {
    const textLines = sourceText.split('\n');
    const totalItemsCount = Number(textLines[0]);
    const initialNumericValues = textLines[1].split(' ').map(Number);

    const transformedNumericValues = initialNumericValues.map(val => parseInt(val.toString(2)));

    const valueOccurrenceMap = transformedNumericValues.reduce((accumulator, currentVal) => {
        accumulator[currentVal] = (accumulator[currentVal] || 0) + 1;
        return accumulator;
    }, {});

    const uniquePresentValues = Object.keys(valueOccurrenceMap).map(Number);
    const uniqueValueQuantity = uniquePresentValues.length;

    const verifyFrequencies = (...args) => args.every(([val, expectedCount]) => valueOccurrenceMap[val] === expectedCount);

    const determineOutcome = (overallCount, distinctValuesArray, distinctCount) => {
        const oneThirdOfTotal = overallCount / 3;

        const logicDispatch = {
            'isDivisibleByThree': {
                '3': () => {
                    const [valX, valY, valZ] = distinctValuesArray;
                    return (valX ^ valY ^ valZ) === 0 && verifyFrequencies([valX, oneThirdOfTotal], [valY, oneThirdOfTotal], [valZ, oneThirdOfTotal]);
                },
                '2': () => {
                    // Original behavior: if 0 is present among the two distinct values, the condition is met.
                    // Otherwise, it's not.
                    return distinctValuesArray.includes(0);
                },
                '1': () => distinctValuesArray[0] === 0,
                'default': () => false
            },
            'isNotDivisibleByThree': {
                '1': () => distinctValuesArray[0] === 0,
                'default': () => false
            }
        };

        const primaryBranchKey = overallCount % 3 === 0 ? 'isDivisibleByThree' : 'isNotDivisibleByThree';
        const secondaryBranchKey = String(distinctCount);

        const handlerFunction = logicDispatch[primaryBranchKey][secondaryBranchKey] || logicDispatch[primaryBranchKey]['default'];
        return handlerFunction();
    };

    const finalConditionMet = determineOutcome(totalItemsCount, uniquePresentValues, uniqueValueQuantity);

    if (finalConditionMet) {
        console.log('Yes');
    } else {
        console.log('No');
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
