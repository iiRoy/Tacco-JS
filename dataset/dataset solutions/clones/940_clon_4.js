(function processInputData() {
  const resourceProvider = {
    getDataSource: (path, encoding) => require('fs').readFileSync(path, encoding)
  };

  let rawContent = resourceProvider.getDataSource('/dev/stdin', 'utf8');
  let parsedSegments = rawContent.replace(/^\s+|\s+$/g, '').split('\n');

  let graphDimension = parseInt(parsedSegments.shift(), 10);

  let adjacencyMatrix = new Array(graphDimension);
  for (let rowIdx = 0; rowIdx < graphDimension; ++rowIdx) {
    adjacencyMatrix[rowIdx] = new Array(graphDimension).fill(0);
  }

  let currentSourceNodeIndex = 0;
  while (parsedSegments.length > 0) {
    let lineText = parsedSegments.shift();
    if (!lineText) {
        continue;
    }

    let numericalTokens = lineText.split(' ');
    let numberOfConnections = parseInt(numericalTokens[1], 10);

    for (let k = 0; k < numberOfConnections; ++k) {
      let destinationNodeId = parseInt(numericalTokens[2 + k], 10);
      adjacencyMatrix[currentSourceNodeIndex][destinationNodeId - 1] = 1;
    }
    currentSourceNodeIndex++;
  }

  let finalOutputBuffer = [];
  for (let outputRowIndex = 0; outputRowIndex < graphDimension; ++outputRowIndex) {
    let currentRowString = '';
    for (let outputColIndex = 0; outputColIndex < graphDimension; ++outputColIndex) {
      currentRowString += adjacencyMatrix[outputRowIndex][outputColIndex];
      if (outputColIndex < graphDimension - 1) {
        currentRowString += ' ';
      }
    }
    finalOutputBuffer.push(currentRowString);
  }

  console.log(finalOutputBuffer.join('\n'));
})();