const generateCoordKey = (row, col) => `r${row}c${col}`;

const memoizationCache = new Map();

const MODULO_CONSTANT = 998244353n;

const computeGridValue = (startRow, startCol, endRow, endCol) => {
  const currentCoordKey = generateCoordKey(endRow, endCol);
  if (memoizationCache.has(currentCoordKey)) {
    return memoizationCache.get(currentCoordKey);
  }

  let computedResult;
  if (startRow === endRow) {
    const exponent = endCol - startCol;
    const powerValue = startRow ** exponent;
    computedResult = powerValue % MODULO_CONSTANT;
  } else if (startCol === endCol) {
    const exponent = endRow - startRow;
    const powerValue = startCol ** exponent;
    computedResult = powerValue % MODULO_CONSTANT;
  } else {
    const termA = computeGridValue(startRow, startCol, endRow - 1n, endCol);
    const termB = computeGridValue(startRow, startCol, endRow, endCol - 1n);
    const termC = computeGridValue(startRow, startCol, endRow - 1n, endCol - 1n);

    const productA = termA * endCol;
    const productB = termB * endRow;
    const multiplierC = (endRow - 1n) * (endCol - 1n);
    const productC = termC * multiplierC;

    const intermediateSum = productA + productB;
    const finalDifference = intermediateSum - productC;
    computedResult = finalDifference % MODULO_CONSTANT;
  }
  memoizationCache.set(generateCoordKey(endRow, endCol), computedResult);
  return computedResult;
};

const processInputData = (rawInputString) => {
  const inputLines = rawInputString.split("\n");
  const firstLineParts = inputLines[0].split(" ");
  const [initialA, initialB, finalC, finalD] = firstLineParts.map(numberString => BigInt(numberString));
  
  console.log(`${initialA}:${initialB}:${finalC}:${finalD}`);
  console.log(Number(computeGridValue(initialA, initialB, finalC, finalD)));
};

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileContent);
