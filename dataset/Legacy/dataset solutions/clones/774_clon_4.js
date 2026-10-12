const fileSystemModule = require('fs');

const inputByteLength = fileSystemModule.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(inputByteLength);
const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputByteLength, 0);
const rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

const initialConfigLine = rawInputLines.shift().split(' ');
const nodeCount = parseInt(initialConfigLine[0]);
const edgeCount = parseInt(initialConfigLine[1]);
const startNodeIndex = parseInt(initialConfigLine[2]) - 1;
const goal1Index = parseInt(initialConfigLine[3]) - 1;
const goal2Index = parseInt(initialConfigLine[4]) - 1;

let currentPathData = new Map();

Array.from({ length: nodeCount }).forEach((_, sourceNode) => {
    const innerMap = new Map();
    Array.from({ length: nodeCount }).forEach((_, targetNode) => {
        innerMap.set(targetNode, sourceNode === targetNode ? 0 : Number.POSITIVE_INFINITY);
    });
    currentPathData.set(sourceNode, innerMap);
});

const edgeInputSegment = rawInputLines.splice(0, edgeCount);
edgeInputSegment.forEach(line => {
    const [sourceStr, destinationStr, weightStr] = line.split(' ');
    const source = parseInt(sourceStr) - 1;
    const destination = parseInt(destinationStr) - 1;
    const weight = parseFloat(weightStr);
    currentPathData.get(source).set(destination, weight);
});

Array.from({ length: nodeCount }).forEach((_, pivotNode) => {
    const nextIterationDistances = new Map();
    Array.from({ length: nodeCount }).forEach((_, sourceNode) => {
        const sourceDistances = new Map();
        Array.from({ length: nodeCount }).forEach((_, targetNode) => {
            const existingPath = currentPathData.get(sourceNode)?.get(targetNode) ?? Number.POSITIVE_INFINITY;
            const pathThroughPivot = (currentPathData.get(sourceNode)?.get(pivotNode) ?? Number.POSITIVE_INFINITY) +
                                     (currentPathData.get(pivotNode)?.get(targetNode) ?? Number.POSITIVE_INFINITY);
            sourceDistances.set(targetNode, Math.min(existingPath, pathThroughPivot));
        });
        nextIterationDistances.set(sourceNode, sourceDistances);
    });
    currentPathData = nextIterationDistances;
});

const minimumCombinedPath = Array.from({ length: nodeCount }, (_, intermediatePoint) => {
    const pathFromStart = currentPathData.get(startNodeIndex)?.get(intermediatePoint) ?? Number.POSITIVE_INFINITY;
    const pathToGoal1 = currentPathData.get(intermediatePoint)?.get(goal1Index) ?? Number.POSITIVE_INFINITY;
    const pathToGoal2 = currentPathData.get(intermediatePoint)?.get(goal2Index) ?? Number.POSITIVE_INFINITY;
    return pathFromStart + pathToGoal1 + pathToGoal2;
}).reduce((accumulator, currentValue) => Math.min(accumulator, currentValue), Number.POSITIVE_INFINITY);

console.log(minimumCombinedPath);
