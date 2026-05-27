'use strict';

const parseInteger = (str) => parseInt(str, 10);

const getBinaryRepresentationAsDecimal = (decimalValue) => parseInteger(decimalValue.toString(2));

function processInput(rawData) {
    const inputLines = rawData.split('\n');
    const totalHats = parseInteger(inputLines[0]);
    const hatMeasurements = inputLines[1].split(' ').map(parseInteger);

    const transformedHatMeasurements = hatMeasurements.map(getBinaryRepresentationAsDecimal);

    const valueFrequencyMap = new Map();
    for (const currentTransformedValue of transformedHatMeasurements) {
        valueFrequencyMap.set(currentTransformedValue, (valueFrequencyMap.get(currentTransformedValue) || 0) + 1);
    }

    const distinctTransformedValues = Array.from(valueFrequencyMap.keys());
    const numberOfDistinctValues = distinctTransformedValues.length;

    let isSolutionPossible = false;

    const ZERO_VALUE_CONSTANT = 0;
    const GROUP_DIVISOR = 3;

    if (totalHats % GROUP_DIVISOR === ZERO_VALUE_CONSTANT) {
        const requiredCountPerGroup = totalHats / GROUP_DIVISOR;

        if (numberOfDistinctValues === GROUP_DIVISOR) {
            const [val1, val2, val3] = distinctTransformedValues;
            const xorSumResult = val1 ^ val2 ^ val3;

            if (xorSumResult === ZERO_VALUE_CONSTANT) {
                if (valueFrequencyMap.get(val1) === requiredCountPerGroup &&
                    valueFrequencyMap.get(val2) === requiredCountPerGroup &&
                    valueFrequencyMap.get(val3) === requiredCountPerGroup) {
                    isSolutionPossible = true;
                }
            }
        } else if (numberOfDistinctValues === 2) {
            // This block replicates the original code's specific behavior:
            // If totalHats is divisible by 3 and there are exactly 2 distinct values,
            // the flag is initially set to true. It remains true unless specific
            // conditions involving the value 0 and its counts are met (or not met).
            isSolutionPossible = true;

            if (distinctTransformedValues.includes(ZERO_VALUE_CONSTANT)) {
                const nonZeroDistinctValue = distinctTransformedValues.find(val => val !== ZERO_VALUE_CONSTANT);
                
                // Check if counts match the pattern for 0 and another value
                if (valueFrequencyMap.get(ZERO_VALUE_CONSTANT) === requiredCountPerGroup &&
                    valueFrequencyMap.get(nonZeroDistinctValue) === (2 * requiredCountPerGroup)) {
                    // If this specific condition is met, isSolutionPossible remains true.
                } else {
                    // If this specific condition is NOT met, the original code still leaves
                    // isSolutionPossible as true due to the initial assignment in this block.
                    // No explicit action needed here to preserve that behavior.
                }
            }
            // If ZERO_VALUE_CONSTANT is not present, isSolutionPossible remains true
            // from the initial assignment within this 'numberOfDistinctValues === 2' block.
        } else if (numberOfDistinctValues === 1) {
            if (distinctTransformedValues[0] === ZERO_VALUE_CONSTANT) {
                isSolutionPossible = true;
            }
        }
    } else { // totalHats % GROUP_DIVISOR !== ZERO_VALUE_CONSTANT
        if (numberOfDistinctValues === 1) {
            if (distinctTransformedValues[0] === ZERO_VALUE_CONSTANT) {
                isSolutionPossible = true;
            }
        }
    }

    if (isSolutionPossible) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
