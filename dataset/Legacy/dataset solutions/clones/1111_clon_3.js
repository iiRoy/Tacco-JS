const fileSystemModule = require('fs');

const generateKeyDetail = (label, arrayIndex, sourceArray) => {
    if (arrayIndex >= 0 && arrayIndex < sourceArray.length) {
        return `${label} = ${sourceArray[arrayIndex]}, `;
    }
    return '';
};

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedKeys = rawInputContent.trim().split(/[ |\n]/).slice(1);

const outputLines = processedKeys.map((currentKey, zeroBasedIndex, allKeys) => {
    const nodeIndexOneBased = zeroBasedIndex + 1;

    let parentKeySegment = '';
    let leftChildKeySegment = '';
    let rightChildKeySegment = '';

    if (nodeIndexOneBased > 1) {
        const parentArrayZeroBasedIndex = Math.floor(nodeIndexOneBased / 2) - 1;
        parentKeySegment = generateKeyDetail('parent key', parentArrayZeroBasedIndex, allKeys);
    }

    const leftChildArrayZeroBasedIndex = (2 * nodeIndexOneBased) - 1;
    leftChildKeySegment = generateKeyDetail('left key', leftChildArrayZeroBasedIndex, allKeys);

    const rightChildArrayZeroBasedIndex = 2 * nodeIndexOneBased;
    rightChildKeySegment = generateKeyDetail('right key', rightChildArrayZeroBasedIndex, allKeys);

    return `node ${nodeIndexOneBased}: key = ${currentKey}, ${parentKeySegment}${leftChildKeySegment}${rightChildKeySegment}`;
});

console.log(outputLines.join('\n'));
