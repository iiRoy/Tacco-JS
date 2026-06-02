function ProcessGridData(rawInputStr) {
  const inputLines = rawInputStr.split("\n");

  const dimensionParts = inputLines[0].split(" ");
  const gridRows = parseInt(dimensionParts[0], 10);
  const gridCols = parseInt(dimensionParts[1], 10);

  const infinityValue = Math.pow(10, 9) + 7;

  const gridLayoutData = inputLines.slice(1, gridRows + 1);
  const gridLayout = gridLayoutData.map(line => line.split(""));

  const directConnections = [];
  let currentCellId = 0;

  const getCellIdentifier = (row, col, width) => row * width + col;

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const currentCellType = gridLayout[r][c];
      if (currentCellType === ".") {
        const currentId = getCellIdentifier(r, c, gridCols);

        // Check for connection to the cell below
        const hasVerticalNeighbor = (r + 1 < gridRows);
        if (hasVerticalNeighbor) {
          const neighborCellType = gridLayout[r + 1][c];
          if (neighborCellType === ".") {
            const neighborId = getCellIdentifier(r + 1, c, gridCols);
            directConnections.push([currentId, neighborId]);
          }
        }

        // Check for connection to the cell to the right
        const hasHorizontalNeighbor = (c + 1 < gridCols);
        if (hasHorizontalNeighbor) {
          const neighborCellType = gridLayout[r][c + 1];
          if (neighborCellType === ".") {
            const neighborId = getCellIdentifier(r, c + 1, gridCols);
            directConnections.push([currentId, neighborId]);
          }
        }
      }
    }
  }

  const totalCells = gridRows * gridCols;
  const shortestPaths = Array.from({ length: totalCells }, () =>
    Array(totalCells).fill(infinityValue)
  );

  for (let i = 0; i < totalCells; i++) {
    shortestPaths[i][i] = 0;
  }

  for (const connection of directConnections) {
    const [nodeA, nodeB] = connection;
    shortestPaths[nodeA][nodeB] = 1;
    shortestPaths[nodeB][nodeA] = 1;
  }

  // Floyd-Warshall algorithm for all-pairs shortest path
  for (let intermediateNode = 0; intermediateNode < totalCells; intermediateNode++) {
    for (let sourceNode = 0; sourceNode < totalCells; sourceNode++) {
      for (let destinationNode = 0; destinationNode < totalCells; destinationNode++) {
        const pathThroughIntermediate = shortestPaths[sourceNode][intermediateNode] + shortestPaths[intermediateNode][destinationNode];
        shortestPaths[sourceNode][destinationNode] = Math.min(
          shortestPaths[sourceNode][destinationNode],
          pathThroughIntermediate
        );
      }
    }
  }

  let maximumPathLength = 0;
  for (let sourceNode = 0; sourceNode < totalCells; sourceNode++) {
    for (let destinationNode = 0; destinationNode < totalCells; destinationNode++) {
      const currentDistance = shortestPaths[sourceNode][destinationNode];
      if (currentDistance < infinityValue) {
        maximumPathLength = Math.max(maximumPathLength, currentDistance);
      }
    }
  }

  console.log('%s', maximumPathLength);
  return maximumPathLength;
}

function testGridSolver(testCaseIndex) {
  const inputElement = document.getElementById("input" + testCaseIndex);
  const outputElement = document.getElementById("output" + testCaseIndex);

  if (!inputElement || !outputElement) {
    console.error(`Elements for test case ${testCaseIndex} not found.`);
    return;
  }

  const testInput = inputElement.value;
  const actualAnswer = ProcessGridData(testInput);
  const expectedAnswer = parseInt(outputElement.value.split("\n")[0], 10);

  let testResultStatus = "WA"; // Wrong Answer
  if (actualAnswer === expectedAnswer) {
    testResultStatus = "AC"; // Accepted
  }

  const resultElement = document.getElementById("result" + testCaseIndex);
  if (resultElement) {
    resultElement.innerHTML = testResultStatus;
  } else {
    console.warn(`Result element for test case ${testCaseIndex} not found.`);
  }
}

ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
