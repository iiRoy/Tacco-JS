var fileSystem = require('fs');
var dataLength = fileSystem.fstatSync(process.stdin.fd).size;
var inputBuffer = Buffer.alloc(dataLength);
var actualBytesRead = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);
var rawInputLines = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

evaluateGeometricSets();

function evaluateGeometricSets() {
  const numberOfTestCases = Number(rawInputLines[0]);

  rawInputLines.slice(1, numberOfTestCases + 1).forEach(currentDataSetString => {
    const numericalComponents = currentDataSetString.split(' ').map(Number);

    const largestComponent = Math.max(...numericalComponents);
    const smallestComponent = Math.min(...numericalComponents);
    const intermediateComponent = numericalComponents.reduce((sum, val) => sum + val, 0) - largestComponent - smallestComponent;

    const formsRightTriangle = (largestComponent * largestComponent === smallestComponent * smallestComponent + intermediateComponent * intermediateComponent);

    console.log(formsRightTriangle ? 'YES' : 'NO');
  });
}
