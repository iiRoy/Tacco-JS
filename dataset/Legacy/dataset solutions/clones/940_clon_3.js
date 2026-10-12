(function executeProgram() {
  const fileSystem = require('fs');
  const rawInputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const trimmedInputContent = rawInputBuffer.trim();
  const inputLines = trimmedInputContent.split('\n');

  const firstLineData = inputLines.shift();
  const matrixSize = Number(firstLineData);

  const adjacencyMatrix = [];
  for (let rowInitializerIndex = 0; rowInitializerIndex < matrixSize; rowInitializerIndex++) {
    const currentRow = [];
    for (let colInitializerIndex = 0; colInitializerIndex < matrixSize; colInitializerIndex++) {
      currentRow.push(0);
    }
    adjacencyMatrix.push(currentRow);
  }

  const processInputLineForMatrix = (lineContent, targetRowIndex, matrixReference) => {
    const lineParts = lineContent.split(' ');
    const relevantNodeStrings = lineParts.slice(2);

    for (let nodeStringIndex = 0; nodeStringIndex < relevantNodeStrings.length; nodeStringIndex++) {
      const nodeValueString = relevantNodeStrings[nodeStringIndex];
      const zeroBasedNodeIndex = Number(nodeValueString) - 1;
      matrixReference[targetRowIndex][zeroBasedNodeIndex] = 1;
    }
  };

  for (let currentLineIndex = 0; currentLineIndex < inputLines.length; currentLineIndex++) {
    const currentInputLine = inputLines[currentLineIndex];
    processInputLineForMatrix(currentInputLine, currentLineIndex, adjacencyMatrix);
  }

  const formatMatrixRowToString = (rowArray) => {
    return rowArray.join(' ');
  };

  const outputLinesArray = [];
  for (let outputRowIndex = 0; outputRowIndex < adjacencyMatrix.length; outputRowIndex++) {
    const rowToFormat = adjacencyMatrix[outputRowIndex];
    outputLinesArray.push(formatMatrixRowToString(rowToFormat));
  }
  console.log(outputLinesArray.join('\n'));
})();
