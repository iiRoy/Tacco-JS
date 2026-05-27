process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
    const [nodeQuantity, edgeQuantity] = inputLines[0].split(" ").map(Number);

    const nodeDegrees = inputLines.slice(1).reduce((degreeRegistry, edgeDescription) => {
        const [firstNode, secondNode] = edgeDescription.split(" ").map(Number);
        degreeRegistry.set(firstNode, (degreeRegistry.get(firstNode) || 0) + 1);
        degreeRegistry.set(secondNode, (degreeRegistry.get(secondNode) || 0) + 1);
        return degreeRegistry;
    }, new Map());

    Array.from({ length: nodeQuantity }, (_, nodeIndex) => nodeIndex + 1)
         .forEach(identifier => {
             console.log(nodeDegrees.get(identifier) || 0);
         });
});
