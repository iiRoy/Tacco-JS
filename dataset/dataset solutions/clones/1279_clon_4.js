'use strict'

const evaluateCollection = (inputPayload) => {
    const lineSegments = inputPayload.trim().split('\n');
    const itemQuantity = Number(lineSegments[0]);
    
    const foundItems = new Set(lineSegments.slice(1, itemQuantity + 1));

    const categories = ['S', 'H', 'C', 'D'];
    const identifiers = Array.from({ length: 13 }, (_, idx) => idx + 1);

    const universalCollection = categories.flatMap(catKey =>
        identifiers.map(idVal => `${catKey} ${idVal}`)
    );

    const missingElements = universalCollection.filter(elementUnit =>
        !foundItems.has(elementUnit)
    );

    if (missingElements.length > 0) {
        console.log(missingElements.join('\n'));
    }
};

evaluateCollection(require('fs').readFileSync('/dev/stdin', 'utf8'));