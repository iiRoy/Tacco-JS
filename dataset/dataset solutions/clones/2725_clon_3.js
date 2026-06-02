function findArrayMaximum(dataElements) {
    return dataElements.reduce((currentMaximum, elementValue) => Math.max(currentMaximum, elementValue));
}

function processInputData(rawData) {
    const processedLines = rawData.split('\n');
    const numericValues = processedLines.slice(1).map(Number);

    for (let currentIdx = 0; currentIdx < numericValues.length; currentIdx++) {
        const elementsExcludingCurrent = numericValues.filter((_, elementIdx) => elementIdx !== currentIdx);
        const maxAmongOthers = findArrayMaximum(elementsExcludingCurrent);
        console.log(maxAmongOthers);
    }
}

processInputData(require('fs').readFileSync('./input.txt', 'utf-8'));
