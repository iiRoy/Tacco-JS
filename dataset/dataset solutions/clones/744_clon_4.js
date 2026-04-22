const rawSourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const textLines = rawSourceContent.trim().split("\n");
let currentLineIndex = 0;

function fetchNextLine() {
    if (currentLineIndex >= textLines.length) {
        return null;
    }
    return textLines[currentLineIndex++];
}

function extractNumericValue() {
    return parseInt(fetchNextLine(), 10);
}

function parseDependencyEntry(entryString) {
    const segments = entryString.split(":");
    const primaryKey = segments[0];
    // The original code uses .slice(0, -1) which removes the last character,
    // then .split(","), and finally filters out empty strings at the very end.
    // This is equivalent to splitting by comma and then filtering out empty strings directly,
    // assuming inputs like "A:B,C," or "A:B,C" should result in ["B", "C"].
    // If "A:B" results in [""] from original, then this interpretation needs adjustment.
    // However, the final filter `v!=""` implies empty strings are never counted.
    // So, directly filtering empty strings during parsing is functionally equivalent.
    const linkedItems = segments[1].split(",").filter(item => item !== '');
    return { primaryKey, linkedItems };
}

while (true) {
    const entityCount = extractNumericValue();
    if (entityCount === 0) {
        break;
    }

    const initialEntryLine = fetchNextLine();
    const { linkedItems: initialElements } = parseDependencyEntry(initialEntryLine);

    const connectionRegistry = new Map(); // Stores A -> [B, C] mappings
    for (let currentMappingIdx = 0; currentMappingIdx < entityCount - 1; ++currentMappingIdx) {
        const mappingLine = fetchNextLine();
        const { primaryKey, linkedItems } = parseDependencyEntry(mappingLine);
        connectionRegistry.set(primaryKey, new Set(linkedItems)); // Use Set to store linked items for efficiency in BFS
    }

    // Breadth-First Search (BFS) to find all reachable elements
    const explorationQueue = [];
    const identifiedElements = new Set();

    // Initialize BFS with the initial elements
    for (const element of initialElements) {
        if (!identifiedElements.has(element)) {
            identifiedElements.add(element);
            explorationQueue.push(element);
        }
    }

    let queueHead = 0; // Optimize array as queue to avoid .shift() performance penalty
    while (queueHead < explorationQueue.length) {
        const currentElement = explorationQueue[queueHead++]; // Dequeue

        if (connectionRegistry.has(currentElement)) {
            for (const dependentItem of connectionRegistry.get(currentElement)) {
                if (!identifiedElements.has(dependentItem)) {
                    identifiedElements.add(dependentItem);
                    explorationQueue.push(dependentItem); // Enqueue
                }
            }
        }
    }
    
    console.log(identifiedElements.size);
}