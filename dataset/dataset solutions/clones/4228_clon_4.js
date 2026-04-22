const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
let allEntries = sourceData.split('\n');

const extractNumbersFromLine = (lineContent) => lineContent.split(' ').map(Number);

const limitVal = extractNumbersFromLine(allEntries.shift())[0];

const costMatrix = Array.from({length: 10}, () => extractNumbersFromLine(allEntries.shift()));

const dataLinesForTallies = allEntries.splice(0, limitVal);
const occurrenceTallies = dataLinesForTallies.flatMap(extractNumbersFromLine).reduce((acc, digitVal) => {
    acc[digitVal]++;
    return acc;
}, new Array(10).fill(0));

const optimizePathMatrix = (initialCosts) => {
    let internalCostData = initialCosts.map(row => [...row]);

    const retrieveCost = (startNode, endNode) => internalCostData[startNode][endNode];
    const updateCost = (startNode, endNode, newValue) => { internalCostData[startNode][endNode] = newValue; };

    Array.from({length: 10}, (_, intermediateNode) => intermediateNode).forEach(intermediateNode => {
        Array.from({length: 10}, (_, originNode) => originNode).forEach(originNode => {
            Array.from({length: 10}, (_, destinationNode) => destinationNode).forEach(destinationNode => {
                updateCost(originNode, destinationNode, Math.min(
                    retrieveCost(originNode, destinationNode),
                    retrieveCost(originNode, intermediateNode) + retrieveCost(intermediateNode, destinationNode)
                ));
            });
        });
    });

    return internalCostData;
};

const processedCostMatrix = optimizePathMatrix(costMatrix);

let finalAccumulation = 0;
for (let digitId = 0; digitId < 10; ++digitId) {
    finalAccumulation += occurrenceTallies[digitId] * processedCostMatrix[digitId][1];
}

console.log(finalAccumulation);