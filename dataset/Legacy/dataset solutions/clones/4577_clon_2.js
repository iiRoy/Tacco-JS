process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputRows = [];
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentInputLine) => {
  inputRows.push(currentInputLine);
});

inputProcessor.on('close', () => {
    const [totalNodes, totalEdges] = inputRows[0].split(" ").map(strVal => Number(strVal));
    const nodeDegrees = [];

    inputRows.forEach((lineData, lineIndex) => {
        if(lineIndex > 0){
            const [nodeA, nodeB] = lineData.split(" ").map(numStr => Number(numStr));
            nodeDegrees[nodeA] = (nodeDegrees[nodeA] || 0) + 1;
            nodeDegrees[nodeB] = (nodeDegrees[nodeB] || 0) + 1;
        }
    });

    for(let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++){
        console.log(nodeDegrees[nodeIdentifier] || 0);
    }
});
