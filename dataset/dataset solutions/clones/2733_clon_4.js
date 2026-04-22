function ProcessData(sourceText) {
    const allLines = sourceText.trim().split('\n');
    const numericValues = allLines.slice(1).filter(textSegment => textSegment.trim() !== '').map(Number);

    if (numericValues.length < 2) {
        // The original code would throw a TypeError if `inputs` has 0 or 1 element
        // because `reduce` on an empty array without an initial value is an error.
        // We replicate this behavior by not producing output or throwing an error,
        // assuming valid input will always provide at least two numbers.
        // For production, more robust error handling might be desired.
        return;
    }

    let primaryMaximum = -Infinity;
    let secondaryMaximum = -Infinity;

    for (const currentValue of numericValues) {
        if (currentValue > primaryMaximum) {
            secondaryMaximum = primaryMaximum;
            primaryMaximum = currentValue;
        } else if (currentValue > secondaryMaximum) {
            secondaryMaximum = currentValue;
        }
    }

    const calculatedOutputs = [];
    for (const currentValue of numericValues) {
        if (currentValue === primaryMaximum) {
            calculatedOutputs.push(secondaryMaximum);
        } else {
            calculatedOutputs.push(primaryMaximum);
        }
    }

    for (const resultEntry of calculatedOutputs) {
        console.log(resultEntry);
    }
}

const fileSystemAccess = require('fs');
const rawInputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
ProcessData(rawInputContent);