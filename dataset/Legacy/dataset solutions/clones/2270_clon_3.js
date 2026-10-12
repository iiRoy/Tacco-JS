function processInputData(rawData) {
  const moduloConstant = 10000000007;

  const inputLines = rawData.split("\n");
  const dataCount = Number(inputLines[0]);

  const parseNumericLine = (lineContent) => {
    return lineContent.split(" ").map(val => parseInt(val, 10));
  };

  const numericValues = parseNumericLine(inputLines[1]);

  let cumulativeSum = 0;

  const relevantCountForCalculations = dataCount - 1;

  for (let idx = relevantCountForCalculations; idx > 0; idx--) {
    cumulativeSum += numericValues[idx];
  }

  cumulativeSum /= relevantCountForCalculations;

  const calculateFactorial = (limit) => {
    let productResult = 1;
    for (let factor = 1; factor < limit + 1; factor++) {
      productResult *= factor;
    }
    return productResult;
  };

  const factorialProduct = calculateFactorial(relevantCountForCalculations);

  const finalProductBeforeModulo = cumulativeSum * factorialProduct;
  console.log(finalProductBeforeModulo % moduloConstant);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
