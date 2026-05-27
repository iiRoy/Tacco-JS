const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

const nodeCount = parseInt(inputLines[0], 10);

const nodeItems = inputLines.slice(1, 1 + nodeCount).map(line => {
    const [valueString, weightString] = line.split(" ");
    return { nodeValue: parseInt(valueString, 10), nodeWeight: parseInt(weightString, 10) };
});

const queryCount = parseInt(inputLines[1 + nodeCount], 10);

const queryItems = inputLines.slice(2 + nodeCount, 2 + nodeCount + queryCount).map(line => {
    const [startNodeString, limitString] = line.split(" ");
    return { initialNodeIndex: parseInt(startNodeString, 10) - 1, maximumWeight: parseInt(limitString, 10) };
});

const calculatePathSum = (currentNodeIndex, currentTotalWeight, currentTotalValue, weightLimit) => {
    if (currentNodeIndex < 0 || currentNodeIndex >= nodeItems.length) {
        return currentTotalValue;
    }

    const { nodeValue, nodeWeight } = nodeItems[currentNodeIndex];

    const nextTotalWeight = currentTotalWeight + nodeWeight;
    let nextTotalValue = currentTotalValue;

    if (nextTotalWeight <= weightLimit) {
        nextTotalValue += nodeValue;
    }

    if (currentNodeIndex === 0) {
        return nextTotalValue;
    }

    return calculatePathSum(currentNodeIndex >> 1, nextTotalWeight, nextTotalValue, weightLimit);
};

queryItems.forEach(query => {
    console.log(calculatePathSum(query.initialNodeIndex, 0, 0, query.maximumWeight));
});
