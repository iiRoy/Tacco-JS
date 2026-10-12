const retrieveInputLines = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    return fileContent.trim().split('\n');
};

let dataLines = retrieveInputLines();

const graphSize = Number(dataLines.shift());

let adjacencyMatrix = Array.from({ length: graphSize }, () =>
    Array.from({ length: graphSize }, () => 0)
);

for (let rowIndex = 0; rowIndex < graphSize; rowIndex++) {
    const currentLineString = dataLines.shift();
    const stringTokens = currentLineString.split(" ");
    const currentLineValues = stringTokens.map(token => Number(token));

    const sourceNodeId = currentLineValues.shift();
    const _discardedCount = currentLineValues.shift();

    const connectedNodeIds = currentLineValues;

    const sourceNodeIndex = sourceNodeId - 1;

    connectedNodeIds.forEach(function(targetNodeId) {
        const targetNodeIndex = targetNodeId - 1;
        adjacencyMatrix[sourceNodeIndex][targetNodeIndex] = 1;
    });
}

const formattedOutput = adjacencyMatrix.map(row => row.join(" ")).join("\n");

console.log(formattedOutput);
