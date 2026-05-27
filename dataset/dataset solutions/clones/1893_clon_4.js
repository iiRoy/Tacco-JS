var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
var [totalItems, dataBlocksCount] = sourceData[0].split(' ').map(Number);

var touchedItemsSet = new Set();

Array.from({ length: dataBlocksCount }, (_, blockIndex) => {
    const lineContainingItemIDs = sourceData[2 + blockIndex * 2];
    lineContainingItemIDs.split(' ').map(Number).forEach(itemIdentifier => {
        touchedItemsSet.add(itemIdentifier);
    });
});

console.log(totalItems - touchedItemsSet.size);
