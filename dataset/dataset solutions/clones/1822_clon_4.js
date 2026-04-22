const processData = (rawData) => {
    const dataLines = rawData.replace(/\s*$/, '').split('\n');
    const entryCount = +dataLines[0];
    const itemCollection = [];

    for (let currentLineIndex = 1; currentLineIndex <= entryCount; ++currentLineIndex) {
        const parts = dataLines[currentLineIndex].split(' ');
        itemCollection.push({
            firstComponent: +parts[0],
            secondComponent: +parts[1]
        });
    }

    let finalResult;
    if ((entryCount & 1) === 1) {
        const centralPosition = (entryCount - 1) / 2;
        const selectedItem = itemCollection[centralPosition];
        finalResult = selectedItem.secondComponent - selectedItem.firstComponent + 1;
    } else {
        const lowerMidPosition = (entryCount / 2) - 1;
        const upperMidPosition = entryCount / 2;

        const lowerItem = itemCollection[lowerMidPosition];
        const upperItem = itemCollection[upperMidPosition];

        finalResult = (upperItem.secondComponent + lowerItem.secondComponent) - (upperItem.firstComponent + lowerItem.firstComponent) + 1;
    }

    return finalResult;
};

const acquiredText = require('node:fs').readFileSync('/dev/stdin', 'utf-8');
const computedValue = processData(acquiredText);

console.log(computedValue);