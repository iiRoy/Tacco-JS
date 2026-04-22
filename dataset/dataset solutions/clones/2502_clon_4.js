"use strict";

const inputProcessor = (sourceText) => {
    let lineSegments = sourceText.trim().split("\n");
    let currentSegmentPosition = 0;

    const fetchUnit = (asString) => {
        let activeSegment = lineSegments[currentSegmentPosition];
        if (typeof activeSegment === "string") {
            lineSegments[currentSegmentPosition] = activeSegment.split(" ");
        }
        let tokens = lineSegments[currentSegmentPosition];
        let extractedValue = tokens.shift(); 

        if (tokens.length === 0) {
            currentSegmentPosition++;
        }
        return asString ? extractedValue : Number(extractedValue);
    };

    const fetchSegment = (asString) => {
        let segmentTokens = lineSegments[currentSegmentPosition++].split(" ");
        return asString ? segmentTokens : segmentTokens.map(Number);
    };

    const fetchBlock = (count, asString) => {
        let blockSegments = lineSegments.slice(currentSegmentPosition, currentSegmentPosition + count);
        currentSegmentPosition += count;
        let processedBlock = blockSegments.map(segment => segment.split(" "));
        return asString ? processedBlock : processedBlock.map(row => row.map(Number));
    };

    return {
        retrieveScalar: fetchUnit,
        retrieveRow: fetchSegment,
        retrieveGrid: fetchBlock,
    };
};

const createMultiDimensionalArray = (initialContent, ...extents) => {
    const buildStructure = (dimensions) => {
        if (dimensions.length === 0) {
            return initialContent;
        }
        const currentExtent = dimensions[0];
        const remainingExtents = dimensions.slice(1);
        return Array.from({ length: currentExtent }, () => buildStructure(remainingExtents));
    };
    return buildStructure(extents);
};

const INFINITE_DISTANCE = 1e15;

const textInterpreter = inputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(performCalculations());

function performCalculations() {
    const dimensionSize = textInterpreter.retrieveScalar();
    const connectionCount = textInterpreter.retrieveScalar();
    const maximumEdgeWeight = textInterpreter.retrieveScalar();
    const initialConnections = textInterpreter.retrieveGrid(connectionCount);
    const queryCount = textInterpreter.retrieveScalar();
    const queryRequests = textInterpreter.retrieveGrid(queryCount);

    const pathMatrix = createMultiDimensionalArray(INFINITE_DISTANCE, dimensionSize, dimensionSize);

    Array.from({ length: dimensionSize }, (_, nodeIndex) => {
        pathMatrix[nodeIndex][nodeIndex] = 0;
    });

    initialConnections.forEach(connection => {
        const [sourceNode, targetNode, weightValue] = connection;
        pathMatrix[sourceNode - 1][targetNode - 1] = weightValue;
        pathMatrix[targetNode - 1][sourceNode - 1] = weightValue;
    });

    Array.from({ length: dimensionSize }, (_, intermediateNode) => {
        Array.from({ length: dimensionSize }, (_, startNode) => {
            Array.from({ length: dimensionSize }, (_, endNode) => {
                const candidatePath = pathMatrix[startNode][intermediateNode] + pathMatrix[intermediateNode][endNode];
                if (candidatePath < pathMatrix[startNode][endNode]) {
                    pathMatrix[startNode][endNode] = candidatePath;
                }
            });
        });
    });

    Array.from({ length: dimensionSize }, (_, startNode) => {
        Array.from({ length: dimensionSize }, (_, endNode) => {
            const currentPathValue = pathMatrix[startNode][endNode];
            if (currentPathValue !== 0) {
                if (currentPathValue > maximumEdgeWeight) {
                    pathMatrix[startNode][endNode] = INFINITE_DISTANCE;
                } else {
                    pathMatrix[startNode][endNode] = 1;
                }
            }
        });
    });

    Array.from({ length: dimensionSize }, (_, intermediateNode) => {
        Array.from({ length: dimensionSize }, (_, startNode) => {
            Array.from({ length: dimensionSize }, (_, endNode) => {
                const candidatePath = pathMatrix[startNode][intermediateNode] + pathMatrix[intermediateNode][endNode];
                if (candidatePath < pathMatrix[startNode][endNode]) {
                    pathMatrix[startNode][endNode] = candidatePath;
                }
            });
        });
    });

    const calculatedOutcomes = queryRequests.map(request => {
        const [origin, destination] = request;
        let queryResult = pathMatrix[origin - 1][destination - 1];
        
        if (queryResult >= INFINITE_DISTANCE) {
            queryResult = 0;
        }
        return queryResult - 1;
    });

    return calculatedOutcomes.join("\n");
}