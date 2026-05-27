(function(sourceData) {
    const dataSegments = sourceData.split('\n');

    const firstCollectionRaw = dataSegments[1];
    const secondCollectionRaw = dataSegments[3];

    const firstNumericElements = firstCollectionRaw.split(' ').map(Number);
    const secondNumericElements = secondCollectionRaw.split(' ').map(Number);

    const uniqueElementsSet = new Set(firstNumericElements);

    const intersectionCount = secondNumericElements.reduce((currentTotal, itemToFind) => {
        return currentTotal + (uniqueElementsSet.has(itemToFind) ? 1 : 0);
    }, 0);

    console.log(intersectionCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
