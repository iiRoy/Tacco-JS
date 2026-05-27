function processInputData(rawData) {
  const parsedLines = rawData.split("\n");

  const gridSize = parseInt(parsedLines[0], 10);
  const heightConstraint = parseInt(parsedLines[1], 10);
  const widthConstraint = parseInt(parsedLines[2], 10);

  const availableHeightRange = gridSize - heightConstraint + 1;
  const availableWidthRange = gridSize - widthConstraint + 1;

  const resultCount = availableHeightRange * availableWidthRange;

  console.log('%s', resultCount);
}

function performDebugOperation() {
  const debugInputContent = document.getElementById("input").value;
  processInputData(debugInputContent);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
