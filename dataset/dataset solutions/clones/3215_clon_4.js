function combineBinaryVectors(firstVector, secondVector) {
  const resultingVector = [];
  for (let itemIndex = 0; itemIndex < firstVector.length; itemIndex++) {
    resultingVector.push(firstVector[itemIndex] ^ secondVector[itemIndex]);
  }
  return resultingVector;
}

function isVectorZero(anyVector) {
  for (const elementValue of anyVector) {
    if (elementValue !== 0) return false;
  }
  return true;
}

function computeMatrixRank(rowsCount, columnsCount, flattenedElements) {
  const initialRowSet = [];
  for (let rCounter = 0; rCounter < rowsCount; rCounter++) {
    initialRowSet.push(flattenedElements.slice(rCounter * columnsCount, (rCounter + 1) * columnsCount));
  }

  const linearBasis = [];

  for (let rowIterator = 0; rowIterator < rowsCount; rowIterator++) {
    let currentVector = [...initialRowSet[rowIterator]];

    for (let basisElement of linearBasis) {
      let pivotColumnIndex = -1;
      for (let colSearch = 0; colSearch < columnsCount; colSearch++) {
        if (basisElement[colSearch] === 1) {
          pivotColumnIndex = colSearch;
          break;
        }
      }

      if (pivotColumnIndex !== -1 && currentVector[pivotColumnIndex] === 1) {
        currentVector = combineBinaryVectors(currentVector, basisElement);
      }
    }

    if (!isVectorZero(currentVector)) {
      let newVectorPivotCol = -1;
      for (let colFind = 0; colFind < columnsCount; colFind++) {
        if (currentVector[colFind] === 1) {
          newVectorPivotCol = colFind;
          break;
        }
      }

      if (newVectorPivotCol !== -1) {
        for (let k = 0; k < linearBasis.length; k++) {
          if (linearBasis[k][newVectorPivotCol] === 1) {
            linearBasis[k] = combineBinaryVectors(linearBasis[k], currentVector);
          }
        }
        linearBasis.push(currentVector);
      }
    }
  }
  return linearBasis.length;
}

function calculateModularExponent(baseValue, exponentValue, modulusValue) {
  let finalProduct = 1;
  baseValue %= modulusValue;
  while (exponentValue > 0) {
    if (exponentValue % 2 === 1) finalProduct = (finalProduct * baseValue) % modulusValue;
    baseValue = (baseValue * baseValue) % modulusValue;
    exponentValue = Math.floor(exponentValue / 2);
  }
  return finalProduct;
}

function executeProblemSolver(rawInputString) {
  let parsedNumericalData = rawInputString.trim().split(/\s+/).map(entry => parseInt(entry, 10));

  let matrixDimensionR = parsedNumericalData.shift();
  let matrixDimensionC = parsedNumericalData.shift();

  let computedLinearRank = computeMatrixRank(matrixDimensionR, matrixDimensionC, parsedNumericalData);

  const largePrimeDivisor = 998244353;

  let firstExponent = matrixDimensionC + matrixDimensionR - 1;
  let firstPowerResult = calculateModularExponent(2, firstExponent, largePrimeDivisor);

  let secondExponent = matrixDimensionC + matrixDimensionR - computedLinearRank - 1;
  let secondPowerResult = calculateModularExponent(2, secondExponent, largePrimeDivisor);

  let finalCalculatedAnswer = (firstPowerResult - secondPowerResult + largePrimeDivisor) % largePrimeDivisor;

  console.log(finalCalculatedAnswer);
}

executeProblemSolver(require('fs').readFileSync('/dev/stdin', 'utf8'));