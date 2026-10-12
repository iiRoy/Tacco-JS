const fileSystemModule = require('fs');

const STD_IN_FD = process.stdin.fd;
const BUFFER_OFFSET = 0;
const ENCODING_UTF8 = 'utf8';
const NEWLINE_DELIMITER = '\n';
const ZERO_STRING_VALUE = '0';
const NUMERIC_ZERO = 0;
const RESULT_STATUS_OK = 'OK';
const RESULT_STATUS_NG = 'NG';
const LAST_CHAR_OFFSET = 1;

function readAllStdinLines() {
    const fileDescriptor = STD_IN_FD;
    const statInfo = fileSystemModule.fstatSync(fileDescriptor);
    const totalInputLength = statInfo.size;
    const inputByteBuffer = Buffer.alloc(totalInputLength);
    const actualBytesReadCount = fileSystemModule.readSync(fileDescriptor, inputByteBuffer, BUFFER_OFFSET, totalInputLength, BUFFER_OFFSET);
    return inputByteBuffer.toString(ENCODING_UTF8, BUFFER_OFFSET, actualBytesReadCount).split(NEWLINE_DELIMITER);
}

let rawInputLines = readAllStdinLines();

function detectCycle(adjacencyGraph, currentVertexIdx, pathVisited) {
    const neighbors = adjacencyGraph[currentVertexIdx];
    if (!neighbors) {
        return false;
    }

    for (let neighborVertexIdx = NUMERIC_ZERO; neighborVertexIdx < neighbors.length; neighborVertexIdx++) {
        const nextNode = neighbors[neighborVertexIdx];

        if (pathVisited.includes(nextNode)) {
            return true;
        }

        const nextPathVisited = pathVisited.concat(nextNode);
        if (detectCycle(adjacencyGraph, nextNode, nextPathVisited)) {
            return true;
        }
    }
    return false;
}

function buildAdjacencyGraph(numNodes, stringCollection) {
    const graphAdjacencyList = [];
    for (let mainLoopIdx = NUMERIC_ZERO; mainLoopIdx < numNodes; mainLoopIdx++) {
        const currentStringValue = stringCollection[mainLoopIdx];
        const lastCharacter = currentStringValue[currentStringValue.length - LAST_CHAR_OFFSET];
        graphAdjacencyList[mainLoopIdx] = [];

        for (let innerLoopIdx = NUMERIC_ZERO; innerLoopIdx < numNodes; innerLoopIdx++) {
            if (mainLoopIdx === innerLoopIdx) {
                continue;
            }
            const targetString = stringCollection[innerLoopIdx];
            const firstCharacterOfTarget = targetString[NUMERIC_ZERO];
            if (lastCharacter === firstCharacterOfTarget) {
                graphAdjacencyList[mainLoopIdx].push(innerLoopIdx);
            }
        }
    }
    return graphAdjacencyList;
}

function printCycleDetectionResult(isCyclePresent) {
    console.log(isCyclePresent ? RESULT_STATUS_OK : RESULT_STATUS_NG);
}

function processAllInputSets() {
    let numberOfStrings;
    let stringCollection;
    let adjacencyGraph;
    let cycleFoundStatus;
    let mainIterationIndex;

    while (rawInputLines[NUMERIC_ZERO] !== ZERO_STRING_VALUE) {
        numberOfStrings = Number(rawInputLines.shift());
        stringCollection = [];
        
        for (mainIterationIndex = NUMERIC_ZERO; mainIterationIndex < numberOfStrings; mainIterationIndex++) {
            stringCollection.push(rawInputLines.shift());
        }

        adjacencyGraph = buildAdjacencyGraph(numberOfStrings, stringCollection);
        
        cycleFoundStatus = false;
        for (mainIterationIndex = NUMERIC_ZERO; mainIterationIndex < numberOfStrings; mainIterationIndex++) {
            const initialPathForTraversal = [mainIterationIndex];
            if (detectCycle(adjacencyGraph, mainIterationIndex, initialPathForTraversal)) {
                cycleFoundStatus = true;
                break;
            }
        }
        printCycleDetectionResult(cycleFoundStatus);
    }
}

processAllInputSets();
