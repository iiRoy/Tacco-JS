"use strict";

class SourceReader {
    constructor(inputContent) {
        this.allLines = inputContent.trim().split('\n');
        this.linePointer = 0;
        this.currentLineTokens = [];
    }

    extractValue(asString = false) {
        if (this.currentLineTokens.length === 0) {
            if (this.linePointer >= this.allLines.length) {
                throw new Error("Input exhausted.");
            }
            this.currentLineTokens = this.allLines[this.linePointer].split(' ').reverse();
        }

        const token = this.currentLineTokens.pop();
        if (this.currentLineTokens.length === 0) {
            this.linePointer++;
        }
        return asString ? token : Number(token);
    }

    extractLine(asStrings = false) {
        if (this.linePointer >= this.allLines.length) {
            throw new Error("Input exhausted.");
        }
        const lineParts = this.allLines[this.linePointer++].split(' ');
        return asStrings ? lineParts : lineParts.map(Number);
    }

    extractMatrix(rowCount, asStrings = false) {
        return Array.from({ length: rowCount }, () => this.extractLine(asStrings));
    }

    extractRawLines(rowCount, asStrings = false) {
        return Array.from({ length: rowCount }, () => {
            if (this.linePointer >= this.allLines.length) {
                throw new Error("Input exhausted.");
            }
            const line = this.allLines[this.linePointer++];
            return asStrings ? line : Number(line);
        });
    }
}

function createNestedArray(dimensions, initialValue) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => createNestedArray(remainingDimensions, initialValue));
}

const MAX_DIST = 1e15;

function solveGraphProblem() {
    const inputProcessor = new SourceReader(require("fs").readFileSync("/dev/stdin", "utf8"));

    const nodeCount = inputProcessor.extractValue();
    const edgeCount = inputProcessor.extractValue();
    const pathLengthThreshold = inputProcessor.extractValue();
    const initialEdges = inputProcessor.extractMatrix(edgeCount);
    const queryCount = inputProcessor.extractValue();
    const queryPairs = inputProcessor.extractMatrix(queryCount);

    let pathCosts = createNestedArray([nodeCount, nodeCount], MAX_DIST);

    Array.from({ length: nodeCount }).forEach((_, idx) => {
        pathCosts[idx][idx] = 0;
    });

    initialEdges.forEach(edgeData => {
        const [sourceNode, targetNode, weight] = edgeData;
        pathCosts[sourceNode - 1][targetNode - 1] = weight;
        pathCosts[targetNode - 1][sourceNode - 1] = weight;
    });

    Array.from({ length: nodeCount }).forEach((_, intermediateNode) => {
        Array.from({ length: nodeCount }).forEach((_, startNode) => {
            Array.from({ length: nodeCount }).forEach((_, endNode) => {
                const pathViaIntermediate = pathCosts[startNode][intermediateNode] + pathCosts[intermediateNode][endNode];
                if (pathViaIntermediate < pathCosts[startNode][endNode]) {
                    pathCosts[startNode][endNode] = pathViaIntermediate;
                }
            });
        });
    });

    pathCosts = pathCosts.map(row =>
        row.map(currentCost => {
            if (currentCost === 0) {
                return 0;
            } else if (currentCost < MAX_DIST && currentCost <= pathLengthThreshold) {
                return 1;
            } else {
                return MAX_DIST;
            }
        })
    );

    Array.from({ length: nodeCount }).forEach((_, pivotNode) => {
        Array.from({ length: nodeCount }).forEach((_, originNode) => {
            Array.from({ length: nodeCount }).forEach((_, destinationNode) => {
                const pathThroughPivot = pathCosts[originNode][pivotNode] + pathCosts[pivotNode][destinationNode];
                if (pathThroughPivot < pathCosts[originNode][destinationNode]) {
                    pathCosts[originNode][destinationNode] = pathThroughPivot;
                }
            });
        });
    });

    const queryResults = queryPairs.map(pair => {
        const [startQueryNode, endQueryNode] = pair;
        let calculatedPathValue = pathCosts[startQueryNode - 1][endQueryNode - 1];
        if (calculatedPathValue >= MAX_DIST) {
            calculatedPathValue = 0;
        }
        return calculatedPathValue - 1;
    });

    return queryResults.join("\n");
}

console.log(solveGraphProblem());
