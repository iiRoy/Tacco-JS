function processGridData(initialInput) {
  const [_, hStr, wStr] = initialInput.match(/^(\d+)\s+(\d+)/);
  const gridHeight = Number(hStr);
  const gridWidth = Number(wStr);

  const isSingleDimension = (gridHeight === 1 || gridWidth === 1);

  const complexCalculationTerm = (gridHeight * gridWidth + 1) / 2;
  const simpleCalculationTerm = 1;

  const finalOutcome = (Number(isSingleDimension) * simpleCalculationTerm) + (Number(!isSingleDimension) * complexCalculationTerm);

  console.log(finalOutcome);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
