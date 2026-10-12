"use strict";

class InputProcessor {
    constructor(sourceData) {
        this.dataTokens = sourceData.split(/ |\n/).filter(Boolean);
        this.currentPosition = 0;
    }

    retrieveNumber() {
        return Number(this.dataTokens[this.currentPosition++]);
    }

    retrieveString() {
        return this.dataTokens[this.currentPosition++];
    }

    retrieveBigInt() {
        return BigInt(this.dataTokens[this.currentPosition++]);
    }

    retrieveNumberSequence(quantity) {
        const sequence = [];
        for (let i = 0; i < quantity; i++) {
            sequence.push(this.retrieveNumber());
        }
        return sequence;
    }
}

const processInput = () => {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const processor = new InputProcessor(rawInput);

    const nodeCount = processor.retrieveNumber();
    const stepLimit = processor.retrieveNumber();
    const nextNodeMap = processor.retrieveNumberSequence(nodeCount).map(val => val - 1);
    const nodeValues = processor.retrieveNumberSequence(nodeCount);

    return calculateOptimalPathScore(nodeCount, stepLimit, nextNodeMap, nodeValues);
};

const calculateOptimalPathScore = (totalNodes, maxSteps, transitionMap, valuesArray) => {
    let overallMaximumScore = BigInt('-2000000000000000000'); // Equivalent to -2e18 as BigInt

    Array.from({ length: totalNodes }, (_, initialNode) => {
        let currentNode = initialNode;
        const pathValueSequence = [];
        const visitedNodeIndices = new Map(); // Maps node ID to its index in pathValueSequence

        let pathTraversalCount = 0;
        let cycleStartPointIndex = -1; // Index in pathValueSequence where a cycle begins

        // Trace the path starting from p[initialNode] until maxSteps or a cycle back to initialNode is detected
        while (pathTraversalCount < maxSteps) {
            currentNode = transitionMap[currentNode]; // Move to the next node in the sequence

            if (visitedNodeIndices.has(currentNode)) {
                cycleStartPointIndex = visitedNodeIndices.get(currentNode);
                break; // Cycle detected
            }

            visitedNodeIndices.set(currentNode, pathTraversalCount);
            pathValueSequence.push(valuesArray[currentNode]);
            pathTraversalCount++;
        }

        let currentPathMaximum = BigInt('-2000000000000000000');

        if (cycleStartPointIndex === -1) { // No cycle back to initialNode detected within maxSteps
            // The pathValueSequence contains up to maxSteps elements.
            // Calculate prefix sums and find the maximum among them.
            let cumulativeSum = 0;
            for (let j = 0; j < pathValueSequence.length; j++) {
                cumulativeSum += pathValueSequence[j];
                currentPathMaximum = (BigInt(cumulativeSum) > currentPathMaximum) ? BigInt(cumulativeSum) : currentPathMaximum;
            }
        } else { // A cycle back to initialNode was detected
            const preCycleSegment = pathValueSequence.slice(0, cycleStartPointIndex);
            const cycleSegment = pathValueSequence.slice(cycleStartPointIndex);
            const cycleSegmentSum = cycleSegment.reduce((sum, val) => sum + val, 0);
            const cycleSegmentLength = cycleSegment.length;

            // Generate prefix sums for the full path segment (pre-cycle + cycle)
            const fullPathPrefixSums = [];
            let cumulativeSum = 0;
            for (const val of preCycleSegment) {
                cumulativeSum += val;
                fullPathPrefixSums.push(cumulativeSum);
            }
            for (const val of cycleSegment) {
                cumulativeSum += val;
                fullPathPrefixSums.push(cumulativeSum);
            }

            // Iterate through all possible end points within the first full traversal of the path
            for (let j = 0; j < fullPathPrefixSums.length; j++) {
                const currentSegmentTotal = BigInt(fullPathPrefixSums[j]);
                const stepsTakenForSegment = j + 1;
                const remainingSteps = maxSteps - stepsTakenForSegment;

                if (remainingSteps >= 0) {
                    let candidateScore = currentSegmentTotal;
                    if (cycleSegmentSum > 0) {
                        // Add full cycles if the cycle sum is positive
                        const numberOfFullCycles = BigInt(Math.floor(remainingSteps / cycleSegmentLength));
                        candidateScore += numberOfFullCycles * BigInt(cycleSegmentSum);
                    }
                    currentPathMaximum = (candidateScore > currentPathMaximum) ? candidateScore : currentPathMaximum;
                }
            }
        }
        overallMaximumScore = (currentPathMaximum > overallMaximumScore) ? currentPathMaximum : overallMaximumScore;
    });

    return overallMaximumScore;
};

const finalResult = processInput();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}
