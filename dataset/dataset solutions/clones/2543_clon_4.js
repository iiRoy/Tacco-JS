function createGridPattern(parameters) {
  const rowCount = parameters[0];
  const colCount = parameters[1];
  const colBoundary = parameters[2];
  const rowBoundary = parameters[3];

  let matrixData = [];

  for (let r = 0; r < rowCount; r++) {
    let currentRow = [];
    for (let c = 0; c < colCount; c++) {
      // The logic for each cell is equivalent to (r < B) XOR (c < A)
      // where B is rowBoundary and A is colBoundary, and XOR is applied
      // to 0/1 representation of the boolean conditions.
      // Specifically, (r >= rowBoundary ? 1 : 0) ^ (c >= colBoundary ? 1 : 0)
      // produces the desired pattern:
      // (r<B, c<A) -> 0^0 = 0
      // (r<B, c>=A) -> 0^1 = 1
      // (r>=B, c<A) -> 1^0 = 1
      // (r>=B, c>=A) -> 1^1 = 0
      currentRow.push((r >= rowBoundary ? 1 : 0) ^ (c >= colBoundary ? 1 : 0));
    }
    matrixData.push(currentRow);
  }

  let formattedOutput = "";
  for (let r = 0; r < rowCount; r++) {
    formattedOutput += matrixData[r].join("");
    if (r < rowCount - 1) {
      formattedOutput += "\n";
    }
  }
  return formattedOutput + "\n";
}

function processInputSource(dataString) {
  // Extract all numbers from the first line of the input string
  return dataString.match(/\d+/g).map(Number);
}

function orchestrateExecution(sourceContent) {
  const numericParams = processInputSource(sourceContent);
  const finalOutput = createGridPattern(numericParams);
  console.log(finalOutput);
}

orchestrateExecution(require("fs").readFileSync("/dev/stdin", "utf8"));