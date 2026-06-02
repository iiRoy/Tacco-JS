function processInputData(rawData) {
    const rawTextLines = rawData.split('\n');
    const numericValues = rawTextLines.map(lineContent => parseInt(lineContent, 10));

    // The first element is a count, which is consumed but not used in the original logic.
    const initialElementDiscarded = numericValues.shift();

    let currentMaximumValue = -Infinity;
    let maximumValueIndex = -1;

    // Iterate to find the maximum value and its first occurrence index
    for (let idx = 0; idx < numericValues.length; idx++) {
        const valueAtCurrentIndex = numericValues[idx];
        if (valueAtCurrentIndex > currentMaximumValue) {
            currentMaximumValue = valueAtCurrentIndex;
            maximumValueIndex = idx;
        }
    }

    // Modify the element at the found maximum index by halving it
    if (maximumValueIndex !== -1) { // Ensure a maximum was found (array not empty)
        numericValues[maximumValueIndex] = numericValues[maximumValueIndex] / 2;
    }

    let accumulatedTotal = 0;
    // Sum all elements in the modified array
    for (const itemValue of numericValues) {
        accumulatedTotal += itemValue;
    }

    console.log(accumulatedTotal);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
