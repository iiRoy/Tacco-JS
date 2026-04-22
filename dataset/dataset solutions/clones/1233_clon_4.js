let sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
let rawLineFragments = sourceData.split('\n');

const translateToNumericArr = (textLine) => {
    return textLine.split(' ').map(val => Number(val));
};

const processLineSequence = (fragments, currentOffset) => {
    if (currentOffset >= fragments.length) {
        return;
    }

    let currentStringItem = fragments[currentOffset];
    let numericCollection = translateToNumericArr(currentStringItem);

    let primaryValue = numericCollection[0];
    let secondaryValue = numericCollection[1];

    if (primaryValue === 0 && secondaryValue === 0) {
        return;
    }

    let sortedElements = [...numericCollection];
    let elementCount = sortedElements.length;

    for (let currentPass = 0; currentPass < elementCount - 1; currentPass++) {
        for (let comparisonIndex = 0; comparisonIndex < elementCount - 1 - currentPass; comparisonIndex++) {
            if (sortedElements[comparisonIndex] > sortedElements[comparisonIndex + 1]) {
                let temporaryHolder = sortedElements[comparisonIndex];
                sortedElements[comparisonIndex] = sortedElements[comparisonIndex + 1];
                sortedElements[comparisonIndex + 1] = temporaryHolder;
            }
        }
    }

    process.stdout.write(sortedElements.join(' ') + '\n');

    processLineSequence(fragments, currentOffset + 1);
};

processLineSequence(rawLineFragments, 0);