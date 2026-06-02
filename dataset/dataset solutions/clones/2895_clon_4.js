'use strict';

function processData(rawData) {
    const inputLines = rawData.split('\n');

    const nodeCount = Number(inputLines.shift());

    const edgeDefinitions = inputLines.slice(0, nodeCount - 1).map(lineContent =>
        lineContent.split(' ').map(Number)
    );

    const numericValues = inputLines[nodeCount - 1].split(' ').map(Number);
    numericValues.sort((valA, valB) => valB - valA);

    const totalSumExcludingMaximum = numericValues.slice(1).reduce((currentSum, valueItem) => currentSum + valueItem, 0);
    console.log(totalSumExcludingMaximum);

    const nodeDepthMap = new Map();

    edgeDefinitions.forEach(([parentIdentifier, childIdentifier]) => {
        const parentIndex = parentIdentifier - 1;
        const childIndex = childIdentifier - 1;

        const parentCurrentDepth = nodeDepthMap.has(parentIndex) ? nodeDepthMap.get(parentIndex) : 0;
        
        nodeDepthMap.set(parentIndex, parentCurrentDepth);
        
        nodeDepthMap.set(childIndex, parentCurrentDepth + 1);
    });

    const nodeStructureDetails = Array.from({ length: nodeCount }, (_, index) => ({
        originalIndex: index,
        assignedDepth: nodeDepthMap.get(index) ?? 0
    }));

    nodeStructureDetails.sort((detailA, detailB) => detailA.assignedDepth - detailB.assignedDepth);

    const orderedAssignments = new Array(nodeCount);
    nodeStructureDetails.forEach((nodeDetail, sortedPosition) => {
        orderedAssignments[nodeDetail.originalIndex] = numericValues[sortedPosition];
    });

    console.log(orderedAssignments.join(' '));
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
