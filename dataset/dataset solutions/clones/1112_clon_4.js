const fileSystem = require('fs');

function generateNodeDescription(keysCollection) {
    const resultLines = [];
    const totalElements = keysCollection.length;

    for (let currentPosition = 0; currentPosition < totalElements; currentPosition++) {
        const oneBasedNodeIdentifier = currentPosition + 1;
        const currentElementValue = keysCollection[currentPosition];
        let segmentBuilders = [`node ${oneBasedNodeIdentifier}: key = ${currentElementValue}, `];

        // Determine parent
        if (oneBasedNodeIdentifier > 1) {
            const parentIndexZeroBased = Math.floor(oneBasedNodeIdentifier / 2) - 1;
            segmentBuilders.push(`parent key = ${keysCollection[parentIndexZeroBased]}, `);
        }

        // Determine left child
        const leftChildIndexZeroBased = (2 * oneBasedNodeIdentifier) - 1;
        if (leftChildIndexZeroBased < totalElements) {
            segmentBuilders.push(`left key = ${keysCollection[leftChildIndexZeroBased]}, `);
        }

        // Determine right child
        const rightChildIndexZeroBased = 2 * oneBasedNodeIdentifier;
        if (rightChildIndexZeroBased < totalElements) {
            segmentBuilders.push(`right key = ${keysCollection[rightChildIndexZeroBased]}, `);
        }

        resultLines.push(segmentBuilders.join(''));
    }
    return resultLines.join('\n');
}

const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const cleanedContent = rawContent.trim();
const tokenizedContent = cleanedContent.split(/[ |\n]/);
const dataElements = tokenizedContent.slice(1);

const finalOutputString = generateNodeDescription(dataElements);
console.log(finalOutputString);
