const sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceText.trim().split("\n");
let inputCursor = 0;

while (true) {
    const blockCount = Number.parseInt(lineSegments[inputCursor++], 10);
    if (blockCount === 0) break;

    const initialLine = lineSegments[inputCursor++];
    const initialContentMatch = initialLine.match(/\[([^\]]+)\]/);
    const seedElements = initialContentMatch[1].split(',');

    const expansionRegistry = new Map();
    for (let k = 0; k < blockCount - 1; k++) {
        const mapLine = lineSegments[inputCursor++];
        const mapContentMatch = mapLine.match(/([^:]+):\[([^\]]+)\]/);
        expansionRegistry.set(mapContentMatch[1], mapContentMatch[2].split(','));
    }

    const discoveredElements = new Set(seedElements);
    const processingQueue = Array.from(seedElements);
    let queueHead = 0;

    while (queueHead < processingQueue.length) {
        const currentElement = processingQueue[queueHead++];

        if (expansionRegistry.has(currentElement)) {
            const relatedElements = expansionRegistry.get(currentElement);
            for (const related of relatedElements) {
                if (!discoveredElements.has(related)) {
                    discoveredElements.add(related);
                    processingQueue.push(related);
                }
            }
        }
    }
    console.log(discoveredElements.size);
}
