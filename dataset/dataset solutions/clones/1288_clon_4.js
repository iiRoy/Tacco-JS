function computeProducts(rawData) {
  const dataLines = rawData.split('\n').filter(Boolean);

  const [rowDimension, colDimension] = dataLines.shift().split(' ').map(Number);

  const matrixElements = dataLines.slice(0, rowDimension).map(line =>
    line.split(' ').map(Number)
  );

  const vectorComponents = dataLines.slice(rowDimension, rowDimension + colDimension).map(Number);

  matrixElements.map(currentMatrixRow =>
    currentMatrixRow.reduce((sumAccumulator, matrixValue, elementIndex) =>
      sumAccumulator + (matrixValue * vectorComponents[elementIndex]), 0)
  ).forEach(finalResult => console.log(finalResult));
}

computeProducts(require("fs").readFileSync("/dev/stdin", "utf8"));
