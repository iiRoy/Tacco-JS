const bitwiseToggle = (val1, val2) => (val1 === val2 ? 0 : 1);

const combineBinaryVectors = (vectorA, vectorB) =>
  vectorA.map((element, index) => bitwiseToggle(element, vectorB[index]));

const determineBinaryRank = (currentMatrix, accumulatedRank = 0) => {
  if (!currentMatrix || currentMatrix.length === 0 || currentMatrix[0].length === 0) {
    return accumulatedRank;
  }

  const currentRows = currentMatrix.length;
  const currentCols = currentMatrix[0].length;

  let pivotFoundRowIndex = -1;
  for (let r = 0; r < currentRows; r++) {
    if (currentMatrix[r][0] === 1) {
      pivotFoundRowIndex = r;
      break;
    }
  }

  if (pivotFoundRowIndex === -1) {
    const reducedColumnMatrix = currentMatrix.map(row => row.slice(1));
    return determineBinaryRank(reducedColumnMatrix, accumulatedRank);
  } else {
    const pivotRowData = currentMatrix[pivotFoundRowIndex];

    const processedRows = currentMatrix.filter((_, idx) => idx !== pivotFoundRowIndex)
      .map(row => (row[0] === 1 ? combineBinaryVectors(pivotRowData, row) : row));

    const nextIterationMatrix = processedRows.map(row => row.slice(1));

    return determineBinaryRank(nextIterationMatrix, accumulatedRank + 1);
  }
};

const calculateModularExponent = (baseValue, exponentValue, moduloValue) => {
  let finalProduct = 1;
  baseValue %= moduloValue;
  while (exponentValue > 0) {
    if (exponentValue % 2 === 1) {
      finalProduct = (finalProduct * baseValue) % moduloValue;
    }
    baseValue = (baseValue * baseValue) % moduloValue;
    exponentValue = Math.floor(exponentValue / 2);
  }
  return finalProduct;
};

const processInputData = (rawData) => {
  const parsedNumbers = rawData.trim().split(/\s+/).map(Number);
  const totalRows = parsedNumbers.shift();
  const totalCols = parsedNumbers.shift();
  const matrixElements = parsedNumbers;

  const initialBinaryMatrix = [];
  for (let r = 0; r < totalRows; r++) {
    initialBinaryMatrix.push(matrixElements.slice(r * totalCols, (r + 1) * totalCols));
  }

  const finalMatrixRank = determineBinaryRank(initialBinaryMatrix);

  const modulusConstant = 998244353;

  const firstPowerResult = calculateModularExponent(2, totalRows + totalCols - 1, modulusConstant);

  const secondPowerResult = calculateModularExponent(2, totalRows + totalCols - finalMatrixRank - 1, modulusConstant);

  const finalComputedValue = (firstPowerResult - secondPowerResult + modulusConstant) % modulusConstant;

  console.log(finalComputedValue);
};

const executeWithStdInput = () => {
    processInputData(require('fs').readFileSync('/dev/stdin','utf8'));
};

executeWithStdInput();