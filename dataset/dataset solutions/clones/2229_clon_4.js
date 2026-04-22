"use strict";

class DataStream {
    #sourceLines;
    #linePointer;
    #tokenBuffer;

    constructor(rawContent) {
        this.#sourceLines = rawContent.trim().split("\n");
        this.#linePointer = 0;
        this.#tokenBuffer = [];
    }

    #refillTokenBuffer() {
        if (this.#linePointer < this.#sourceLines.length) {
            this.#tokenBuffer = this.#sourceLines[this.#linePointer].split(" ").reverse();
            this.#linePointer++;
        } else {
            this.#tokenBuffer = []; // Mark as exhausted
        }
    }

    extractNextValue(isString = false) {
        if (this.#tokenBuffer.length === 0) {
            this.#refillTokenBuffer();
            if (this.#tokenBuffer.length === 0) {
                // Return undefined or throw an error based on desired behavior for exhausted input
                return undefined;
            }
        }
        const val = this.#tokenBuffer.pop();
        return isString ? val : Number(val);
    }

    extractFullLine(isStrings = false) {
        if (this.#linePointer >= this.#sourceLines.length) {
             // Return undefined or throw an error based on desired behavior for exhausted input
            return undefined;
        }
        const lineContent = this.#sourceLines[this.#linePointer++].split(" ");
        return isStrings ? lineContent : lineContent.map(Number);
    }

    extractMultiLine(count, isStrings = false) {
        const collection = [];
        for (let i = 0; i < count; i++) {
            collection.push(this.extractFullLine(isStrings));
        }
        return collection;
    }
}

function constructNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDimSize }, () =>
        constructNestedArray(initialValue, ...remainingDims)
    );
}

let networkGraph;
let edgeQueryDependencies;
let edgeKeyToId = new Map();

function navigatePath(originNode, destinationNode, previousNode, currentPathAccumulator) {
    currentPathAccumulator.push(originNode);
    if (originNode === destinationNode) {
        return currentPathAccumulator;
    }

    for (const connectedNode of networkGraph[originNode]) {
        if (connectedNode === previousNode) {
            continue;
        }
        const discoveredRoute = navigatePath(connectedNode, destinationNode, originNode, currentPathAccumulator);
        if (discoveredRoute) {
            return discoveredRoute;
        }
    }
    currentPathAccumulator.pop();
    return null;
}

function initiateProcessing() {
    const inputReader = new DataStream(require("fs").readFileSync("/dev/stdin", "utf8"));

    const vertexCount = inputReader.extractNextValue();
    networkGraph = constructNestedArray([], vertexCount);
    edgeQueryDependencies = constructNestedArray(0, vertexCount - 1);

    for (let currentEdgeIdx = 0; currentEdgeIdx < vertexCount - 1; ++currentEdgeIdx) {
        const nodeEndpointA = inputReader.extractNextValue() - 1;
        const nodeEndpointB = inputReader.extractNextValue() - 1;

        const smallerEndpoint = Math.min(nodeEndpointA, nodeEndpointB);
        const largerEndpoint = Math.max(nodeEndpointA, nodeEndpointB);
        edgeKeyToId.set(`${smallerEndpoint}-${largerEndpoint}`, currentEdgeIdx);

        networkGraph[nodeEndpointA].push(nodeEndpointB);
        networkGraph[nodeEndpointB].push(nodeEndpointA);
    }

    const queryCount = inputReader.extractNextValue();
    for (let queryIter = 0; queryIter < queryCount; ++queryIter) {
        const queryStartNode = inputReader.extractNextValue() - 1;
        const queryEndNode = inputReader.extractNextValue() - 1;
        const queryBitIdentifier = 1 << queryIter;

        const pathSegmentNodes = navigatePath(queryStartNode, queryEndNode, -1, []);
        
        if (!pathSegmentNodes) { 
            continue;
        }

        for (let pathStep = 1; pathStep < pathSegmentNodes.length; ++pathStep) {
            const previousPathNode = pathSegmentNodes[pathStep - 1];
            const currentPathNode = pathSegmentNodes[pathStep];

            const segmentMinNode = Math.min(previousPathNode, currentPathNode);
            const segmentMaxNode = Math.max(previousPathNode, currentPathNode);
            const edgeIdentifierKey = `${segmentMinNode}-${segmentMaxNode}`;

            const correspondingEdgeId = edgeKeyToId.get(edgeIdentifierKey);
            if (correspondingEdgeId !== undefined) {
                edgeQueryDependencies[correspondingEdgeId] |= queryBitIdentifier;
            }
        }
    }

    const totalQuerySubsets = 1 << queryCount;
    let waysToFormSubset = constructNestedArray(0, totalQuerySubsets);
    waysToFormSubset[0] = 1;

    for (let edgeProcessingIter = 0; edgeProcessingIter < vertexCount - 1; ++edgeProcessingIter) {
        const currentEdgeMask = edgeQueryDependencies[edgeProcessingIter];
        if (currentEdgeMask === 0) {
            waysToFormSubset = waysToFormSubset.map(count => count * 2);
        } else {
            for (let currentSubsetState = totalQuerySubsets - 1; currentSubsetState >= 0; --currentSubsetState) {
                if ((currentSubsetState & currentEdgeMask) === currentEdgeMask) {
                    waysToFormSubset[currentSubsetState] *= 2;
                } else {
                    waysToFormSubset[currentSubsetState | currentEdgeMask] += waysToFormSubset[currentSubsetState];
                }
            }
        }
    }

    return waysToFormSubset[totalQuerySubsets - 1];
}

const finalResult = initiateProcessing();
if (finalResult !== undefined) {
    console.log(finalResult);
}