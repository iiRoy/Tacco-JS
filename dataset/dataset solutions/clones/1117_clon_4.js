const sourceData = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const placeElement = (currentItems, newcomer) => {
    let insertionIndex = 0;
    while (insertionIndex < currentItems.length && currentItems[insertionIndex] >= newcomer) {
        insertionIndex++;
    }
    currentItems.splice(insertionIndex, 0, newcomer);
    return currentItems;
};

const removeTop = (currentItems) => {
    return currentItems.shift();
};

const processedCollection = sourceData.reduce((presentItems, currentLine) => {
    const operationSegments = currentLine.split(' ');
    const commandType = operationSegments[0];

    switch(commandType) {
        case 'insert':
            const numericValue = Number(operationSegments[1]);
            return placeElement(presentItems, numericValue);
        case 'extract':
            const retrievedValue = removeTop(presentItems);
            console.log(retrievedValue);
            return presentItems;
        default:
            return presentItems;
    }
}, []);