'use strict';

const parseLineToNumbers = (lineContent) => {
    return lineContent.split(' ').map(str => Number(str));
};

function processGraphData(rawInputString) {
    const trimmedAndSplitLines = rawInputString.trim().split('\n');

    const firstInputLine = trimmedAndSplitLines.shift();
    const initialCounts = parseLineToNumbers(firstInputLine);
    const numberOfNodes = initialCounts[0];
    const numberOfQueries = initialCounts[1];

    const graphConnections = Array.from({ length: numberOfNodes + 1 }, () => []);
    const accumulatedNodeValues = new Array(numberOfNodes + 1).fill(0);

    const connectionPhaseEndIndex = numberOfNodes - 1;

    trimmedAndSplitLines.forEach((currentInputLine, lineIndex) => {
        const lineNumericData = parseLineToNumbers(currentInputLine);
        const primaryNodeId = lineNumericData[0];
        const secondaryValue = lineNumericData[1];

        if (lineIndex < connectionPhaseEndIndex) {
            graphConnections[primaryNodeId].push(secondaryValue);
        } else {
            accumulatedNodeValues[primaryNodeId] += secondaryValue;
        }
    });

    const propagationQueue = [1];

    const performValuePropagation = (sourceNodeId) => {
        const childrenOfSource = graphConnections[sourceNodeId];
        const valueToPropagate = accumulatedNodeValues[sourceNodeId];

        for (let childIndex = 0; childIndex < childrenOfSource.length; childIndex++) {
            const childNodeId = childrenOfSource[childIndex];
            accumulatedNodeValues[childNodeId] += valueToPropagate;
            propagationQueue.push(childNodeId);
        }
    };

    while (propagationQueue.length > 0) {
        const nextNodeInQueue = propagationQueue.shift();
        performValuePropagation(nextNodeInQueue);
    }

    accumulatedNodeValues.shift();

    console.log(accumulatedNodeValues.join(' '));
}

processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));
