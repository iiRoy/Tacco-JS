function processAndCompute(rawInputData) {
  const numericStrings = rawInputData.split(" ");

  const parseIntegerFromString = (strValue) => {
    return parseInt(strValue, 10);
  };

  const firstOperand = parseIntegerFromString(numericStrings[0]);
  const secondOperand = parseIntegerFromString(numericStrings[1]);

  const MULTIPLICATION_FACTOR = 3;
  const DIVISION_FACTOR = 2;

  const intermediateProduct = firstOperand * MULTIPLICATION_FACTOR;
  const intermediateSum = intermediateProduct + secondOperand;
  const intermediateDivisionResult = intermediateSum / DIVISION_FACTOR;

  const finalComputedValue = Math.floor(intermediateDivisionResult);

  console.log(finalComputedValue);
}

const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processAndCompute(inputContent);
