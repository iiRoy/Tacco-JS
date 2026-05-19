function ProcessInput(rawData) {
  let parsedLines = rawData.split("\n");

  let gridSize = parseInt(parsedLines[0]);
  let heightConstraint = parseInt(parsedLines[1]);
  let widthConstraint = parseInt(parsedLines[2]);

  let resultValue = (gridSize - heightConstraint + 1) * (gridSize - widthConstraint + 1);

  console.log('%s', resultValue);
}

// This auxiliary function is for local testing purposes.
function testFunction() {
  const testData = document.getElementById("input").value;
  ProcessInput(testData);
}

// Invoke the primary processing function with data from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
