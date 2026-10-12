class InputProcessor {
    constructor(inputLines) {
        this.dataLines = inputLines;
        this.currentLineIndex = 0;
        this.maxLines = inputLines.length;
    }

    hasMore() {
        return this.currentLineIndex < this.maxLines;
    }

    pullNext() {
        if (this.hasMore()) {
            return this.dataLines[this.currentLineIndex++];
        } else {
            throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
        }
    }
}

const conversionDispatch = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(' ')],
    [4, (val) => val.split(' ').map(Number)],
    [6, (val) => val.split('')],
    [7, (val) => val.split('').map(Number)],
    [8, (val) => val.join(' ')],
    [9, (val) => val.join('\n')],
    [0, (val) => val.join('')]
]);

function processInputConversion(inputValue, conversionKey) {
    try {
        const converter = conversionDispatch.get(conversionKey);
        return converter ? converter(inputValue) : inputValue;
    } catch (e) {
        return inputValue;
    }
}

let inputHandler;
const bufferedInput = [];

const consoleReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

consoleReader.on('line', (lineContent) => bufferedInput.push(lineContent));
consoleReader.on('close', () => {
    inputHandler = new InputProcessor(bufferedInput);
    console.error('\n');
    const operationStart = Date.now();
    performGraphAssignment();
    const operationEnd = Date.now() - operationStart;
    logDiagnosticInfo('execution time : ' + operationEnd + 'ms');
    logDiagnosticInfo('memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function retrieveNextInteger() { return processInputConversion(inputHandler.pullNext(), 1); }
function retrieveNextStringArray() { return processInputConversion(inputHandler.pullNext(), 2); }
function retrieveNextIntegerArray() { return processInputConversion(inputHandler.pullNext(), 4); }
function retrieveNextCharacterArray() { return processInputConversion(inputHandler.pullNext(), 6); }
function retrieveNextLine() { return inputHandler.pullNext(); }
function hasMoreData() { return inputHandler.hasMore(); }

function emitOutput(dataPayload) { console.log(dataPayload); }
function logDiagnosticInfo(messageContent) { console.error('debug:' + require('util').inspect(messageContent, false, null)); }

function performGraphAssignment() {
    const vertexCount = retrieveNextInteger();
    const adjacencyMatrix = Array.from({ length: vertexCount }, () => []);
    const vertexDepths = new Array(vertexCount).fill(null);
    const vertexAssignedValues = new Array(vertexCount).fill(-1);
    const visitedMarkers = new Array(vertexCount).fill(false);

    for (let linkIdx = 0; linkIdx < vertexCount - 1; linkIdx++) {
        const connectionData = retrieveNextIntegerArray();
        const nodeA = connectionData[0] - 1;
        const nodeB = connectionData[1] - 1;
        adjacencyMatrix[nodeA].push(nodeB);
        adjacencyMatrix[nodeB].push(nodeA);
    }

    let oddLevelNodeCount = 0;
    let evenLevelNodeCount = 0;
    const bfsTraversalQueue = [0];
    visitedMarkers[0] = true;
    vertexDepths[0] = 1;

    while (bfsTraversalQueue.length > 0) {
        const currentVertexIdentifier = bfsTraversalQueue.shift();
        const currentVertexDepth = vertexDepths[currentVertexIdentifier];

        if (currentVertexDepth % 2 === 1) {
            oddLevelNodeCount++;
        } else {
            evenLevelNodeCount++;
        }

        for (const connectedNeighbor of adjacencyMatrix[currentVertexIdentifier]) {
            if (!visitedMarkers[connectedNeighbor]) {
                visitedMarkers[connectedNeighbor] = true;
                vertexDepths[connectedNeighbor] = currentVertexDepth + 1;
                bfsTraversalQueue.push(connectedNeighbor);
            }
        }
    }

    const valueSequenceStates = {
        primary: 1,
        secondary: 2,
        tertiary: 3
    };

    const getNextSequenceTerm = (sequenceKey) => {
        const termValue = valueSequenceStates[sequenceKey];
        valueSequenceStates[sequenceKey] += 3;
        return termValue;
    };

    const thresholdValue = vertexCount / 3;
    const isDualDominantStrategy = (oddLevelNodeCount > thresholdValue && evenLevelNodeCount > thresholdValue);
    const isOddLevelFavored = (oddLevelNodeCount < evenLevelNodeCount);

    // First pass: Conditional value assignment
    vertexDepths.forEach((currentDepth, vertexIndex) => {
        if (isDualDominantStrategy) {
            if (currentDepth % 2 === 1) { // Odd depth
                const assignedVal = getNextSequenceTerm('primary');
                if (assignedVal <= vertexCount) {
                    vertexAssignedValues[vertexIndex] = assignedVal;
                } else {
                    valueSequenceStates.primary -= 3; // Revert if not used
                }
            } else { // Even depth
                const assignedVal = getNextSequenceTerm('secondary');
                if (assignedVal <= vertexCount) {
                    vertexAssignedValues[vertexIndex] = assignedVal;
                } else {
                    valueSequenceStates.secondary -= 3; // Revert if not used
                }
            }
        } else { // Single dominant strategy
            if (isOddLevelFavored) { // oddLevelNodeCount < evenLevelNodeCount
                if (currentDepth % 2 === 1) { // Odd depth
                    const assignedVal = getNextSequenceTerm('tertiary');
                    if (assignedVal <= vertexCount) {
                        vertexAssignedValues[vertexIndex] = assignedVal;
                    } else {
                        valueSequenceStates.tertiary -= 3; // Revert if not used
                    }
                }
            } else { // oddLevelNodeCount >= evenLevelNodeCount
                if (currentDepth % 2 === 0) { // Even depth
                    const assignedVal = getNextSequenceTerm('tertiary');
                    if (assignedVal <= vertexCount) {
                        vertexAssignedValues[vertexIndex] = assignedVal;
                    } else {
                        valueSequenceStates.tertiary -= 3; // Revert if not used
                    }
                }
            }
        }
    });

    // Second pass: Fill in any remaining unassigned nodes
    vertexAssignedValues.forEach((assignedVal, vertexIndex) => {
        if (assignedVal === -1) {
            let valueSet = false;
            let currentSequenceValue;

            currentSequenceValue = getNextSequenceTerm('primary');
            if (currentSequenceValue <= vertexCount) {
                vertexAssignedValues[vertexIndex] = currentSequenceValue;
                valueSet = true;
            } else {
                valueSequenceStates.primary -= 3; // Revert
            }

            if (!valueSet) {
                currentSequenceValue = getNextSequenceTerm('secondary');
                if (currentSequenceValue <= vertexCount) {
                    vertexAssignedValues[vertexIndex] = currentSequenceValue;
                    valueSet = true;
                } else {
                    valueSequenceStates.secondary -= 3; // Revert
                }
            }

            if (!valueSet) {
                currentSequenceValue = getNextSequenceTerm('tertiary');
                if (currentSequenceValue <= vertexCount) {
                    vertexAssignedValues[vertexIndex] = currentSequenceValue;
                } else {
                    valueSequenceStates.tertiary -= 3; // Revert
                }
            }
        }
    });

    emitOutput(processInputConversion(vertexAssignedValues, 8));
}
