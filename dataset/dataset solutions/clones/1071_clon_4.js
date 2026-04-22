function processorOfData(rawData) {
    const parsedLines = rawData.trim().split('\n');

    // The first line represents the count of elements.
    // The original code extracts it but the core logic
    // of the partition function implicitly uses the array's length.
    // We consume it to get to the actual data line.
    parsedLines.shift(); // Discarding the 'n' line

    const valueSequenceLine = parsedLines.shift(); // The line with space-separated numbers
    const numericalEntities = valueSequenceLine.split(' ').map(val => Number(val));

    const finalArrangement = sorterFunction(numericalEntities);

    return finalArrangement.join(' ');
}

function sorterFunction(itemSequence) {
    if (itemSequence.length === 0) {
        return [];
    }

    // The original pivot is the last element of the effective array.
    const keyElement = itemSequence[itemSequence.length - 1];
    // Create a new array without the pivot.
    const remainingItems = itemSequence.slice(0, itemSequence.length - 1);

    // Functionally filter elements into two groups.
    const lesserOrEqualItems = remainingItems.filter(item => item <= keyElement);
    const greaterItems = remainingItems.filter(item => item > keyElement);

    // Format the pivot as a string with brackets.
    const formattedKeyElement = `[${keyElement}]`;

    // Concatenate the groups with the formatted pivot in the middle.
    return lesserOrEqualItems.concat(formattedKeyElement).concat(greaterItems);
}

// Mimic the original execution context for reading input and printing output.
const systemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedOutput = processorOfData(systemInput);
console.log(processedOutput);