const parseNumericLine = (lineString) => {
    return lineString.split(" ").map(val => Number(val));
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

const receivedLines = [];
const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentInputLine) => {
  receivedLines.push(currentInputLine);
});

inputHandler.on('close', () => {
    const [totalNodes, totalEdges] = parseNumericLine(receivedLines[0]);

    const nodeDegrees = new Array(totalNodes + 1).fill(0);

    for (let lineIndex = 1; lineIndex < receivedLines.length; lineIndex++) {
        const currentLineContent = receivedLines[lineIndex];
        const [firstNodeId, secondNodeId] = parseNumericLine(currentLineContent);

        nodeDegrees[firstNodeId]++;
        nodeDegrees[secondNodeId]++;
    }

    for(let nodeId = 1; nodeId <= totalNodes; nodeId++){
        console.log(nodeDegrees[nodeId]);
    }
});
