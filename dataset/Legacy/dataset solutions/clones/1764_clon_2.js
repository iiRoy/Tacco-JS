const generateCoordKey = (rowIdx, colIdx) => `r${rowIdx}c${colIdx}`;

const memoizationCache = new Map();

const computeValue = (startRow, startCol, endRow, endCol) => {
  const cacheKey = generateCoordKey(endRow, endCol);
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }

  let resultVal;
  if (startRow === endRow) {
    resultVal = (startRow ** (endCol - startCol)) % 998244353n;
  } else if (startCol === endCol) {
    resultVal = (startCol ** (endRow - startRow)) % 998244353n;
  } else {
    resultVal = (
      computeValue(startRow, startCol, endRow - 1n, endCol) * endCol +
      computeValue(startRow, startCol, endRow, endCol - 1n) * endRow -
      computeValue(startRow, startCol, endRow - 1n, endCol - 1n) * (endRow - 1n) * (endCol - 1n)
    ) % 998244353n;
  }
  memoizationCache.set(generateCoordKey(endRow, endCol), resultVal);
  return resultVal;
};

const processInputAndDisplay = (rawData) => {
  const inputLines = rawData.split("\n");
  const [initialA, initialB, finalC, finalD] = inputLines[0].split(" ").map(numericStr => BigInt(numericStr));
  console.log(Number(computeValue(initialA, initialB, finalC, finalD)));
};

processInputAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
