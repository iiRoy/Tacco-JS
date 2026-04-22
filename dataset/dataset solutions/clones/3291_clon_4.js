'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

const processRoutine = (dataPayload) => {
    const dataSegments = dataPayload.split('\n');
    const totalNodes = Number(dataSegments[0]);
    const nodeAltitudes = dataSegments[1].split(' ').map(Number);

    const memoizedCosts = new Map();

    const calculateMinimalCost = (currentIndex) => {
        if (currentIndex === 0) {
            return 0;
        }
        if (memoizedCosts.has(currentIndex)) {
            return memoizedCosts.get(currentIndex);
        }

        let costFromPreviousNode = Number.POSITIVE_INFINITY;
        let costFromTwoNodesBack = Number.POSITIVE_INFINITY;

        if (currentIndex > 0) {
            costFromPreviousNode = calculateMinimalCost(currentIndex - 1) + Math.abs(nodeAltitudes[currentIndex - 1] - nodeAltitudes[currentIndex]);
        }
        if (currentIndex > 1) {
            costFromTwoNodesBack = calculateMinimalCost(currentIndex - 2) + Math.abs(nodeAltitudes[currentIndex - 2] - nodeAltitudes[currentIndex]);
        }

        const currentMinimalCost = Math.min(costFromPreviousNode, costFromTwoNodesBack);
        memoizedCosts.set(currentIndex, currentMinimalCost);
        return currentMinimalCost;
    };

    console.log(calculateMinimalCost(totalNodes - 1));
};

processRoutine(require("fs").readFileSync("/dev/stdin", "utf8"));