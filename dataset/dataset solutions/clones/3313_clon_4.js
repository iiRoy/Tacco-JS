'use strict';

const processRawData = (inputString) => {
    const parsedLines = inputString.trim().split('\n').map(lineSegment =>
        lineSegment.split(' ').map(valStr => parseInt(valStr, 10))
    );

    const [dimensions, ...connectionEntries] = parsedLines;
    const [totalNodes, totalEdges] = dimensions;

    const originNodes = connectionEntries.map(pairEntry => pairEntry[0]);
    const destinationNodes = connectionEntries.map(pairEntry => pairEntry[1]);

    return { totalNodes, totalEdges, originNodes, destinationNodes };
};

const deriveMaxPathLengths = ({ totalNodes, totalEdges, originNodes, destinationNodes }) => {
    const pathLengthRecords = Array.from({ length: totalEdges + 1 }).reduce((accumulatedRecords, _, currentStep) => {
        if (currentStep === 0) {
            accumulatedRecords.push(new Map());
            return accumulatedRecords;
        }

        const previousStepMap = accumulatedRecords[currentStep - 1];
        const currentStepMap = new Map();

        originNodes.forEach((sourceNodeId, connectionIndex) => {
            const targetNodeId = destinationNodes[connectionIndex];
            const lengthFromPrevStep = previousStepMap.get(sourceNodeId) || 0;
            const potentialNewLength = lengthFromPrevStep + 1;

            const existingLengthAtTarget = currentStepMap.get(targetNodeId) || 0;
            currentStepMap.set(targetNodeId, Math.max(existingLengthAtTarget, potentialNewLength));
        });

        accumulatedRecords.push(currentStepMap);
        return accumulatedRecords;
    }, []);

    const finalIterationMap = pathLengthRecords[totalEdges];
    return finalIterationMap.size > 0 ? Math.max(...finalIterationMap.values()) : 0;
};

console.log(
    (() => {
        const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        const { totalNodes, totalEdges, originNodes, destinationNodes } = processRawData(inputContent);
        const finalResult = deriveMaxPathLengths({ totalNodes, totalEdges, originNodes, destinationNodes });
        return finalResult.toString();
    })()
);
