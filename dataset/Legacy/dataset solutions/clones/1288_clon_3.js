function processInputData(rawData) {
  const allInputLines = rawData.trim().split("\n");

  const dimensionLineContent = allInputLines[0];
  const dimensionStringParts = dimensionLineContent.split(" ");
  const numRows = Number(dimensionStringParts[0]);
  const numCols = Number(dimensionStringParts[1]);

  const matrixData = [];
  for (let rIdx = 0; rIdx < numRows; rIdx++) {
    const currentRowText = allInputLines[rIdx + 1];
    const rowNumericValues = currentRowText.split(" ").map((strVal) => Number(strVal));
    matrixData.push(rowNumericValues);
  }

  const vectorData = [];
  const vectorElementsStartIndex = numRows + 1;
  for (let cIdx = 0; cIdx < numCols; cIdx++) {
    const currentVectorElementText = allInputLines[vectorElementsStartIndex + cIdx];
    const elementNumericValue = Number(currentVectorElementText);
    vectorData.push(elementNumericValue);
  }

  const calculateDotProductForVector = (rowArray, targetVector) => {
    let accumulatedSum = 0;
    const vectorComponentCount = targetVector.length;
    for (let k = 0; k < vectorComponentCount; k++) {
      const productTerm = rowArray[k] * targetVector[k];
      accumulatedSum += productTerm;
    }
    return accumulatedSum;
  };

  for (let rIdx = 0; rIdx < numRows; rIdx++) {
    const currentRowToProcess = matrixData[rIdx];
    const finalRowResult = calculateDotProductForVector(currentRowToProcess, vectorData);
    console.log(finalRowResult);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
