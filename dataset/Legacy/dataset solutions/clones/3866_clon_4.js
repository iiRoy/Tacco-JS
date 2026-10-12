function processInputData(rawData) {
  const dataLines = rawData.split("\n");
  const matrixDimension = +dataLines[0];
  const baseStrings = Array.from({ length: matrixDimension }, (_, index) => dataLines[index + 1]);
  return { matrixDimension, baseStrings };
}

function evaluateSymmetry(dimension, strings, rowOffset, colOffset) {
  // This function checks if a cyclically shifted matrix is symmetric.
  // The matrix element at (r, c) is strings[(r + rowOffset) % dimension][(c + colOffset) % dimension]
  // We need to verify if M[r][c] === M[c][r] for all r < c.
  return Array.from({ length: dimension }).every((_, rIndex) =>
    Array.from({ length: dimension - (rIndex + 1) }).every((__, kOffset) => {
      const cIndex = rIndex + 1 + kOffset; // cIndex iterates from rIndex + 1 to dimension - 1

      const charA = strings[(rIndex + rowOffset) % dimension][(cIndex + colOffset) % dimension];
      const charB = strings[(cIndex + colOffset) % dimension][(rIndex + rowOffset) % dimension];

      return charA === charB;
    })
  );
}

function calculateTotalSymmetricConfigurations(dimension, strings) {
  // This calculates the sum of results from evaluateSymmetry for all possible shifts.
  return Array.from({ length: dimension }).reduce((totalCount, _, currentRowsOffset) => {
    return totalCount + Array.from({ length: dimension }).reduce((innerSum, __, currentColsOffset) => {
      return innerSum + (evaluateSymmetry(dimension, strings, currentRowsOffset, currentColsOffset) ? 1 : 0);
    }, 0);
  }, 0);
}

function executeProgram(inputContent) {
  const { matrixDimension, baseStrings } = processInputData(inputContent);
  const finalResult = calculateTotalSymmetricConfigurations(matrixDimension, baseStrings);
  console.log(finalResult);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
