function calculateProduct(rawInputString) {
  const inputParts = rawInputString.trim().split(" ");

  const parseIntegerWithRadix = (strValue) => {
    const radixBase = 10;
    return parseInt(strValue, radixBase);
  };

  const iterationCount = parseIntegerWithRadix(inputParts[0]);
  const initialValue = parseIntegerWithRadix(inputParts[1]);

  let finalProduct = initialValue;

  const multiplicationFactor = initialValue - 1;

  let operationsRemaining = iterationCount - 1;

  if (operationsRemaining > 0) {
    let currentOperationIndex = 0;
    while (currentOperationIndex < operationsRemaining) {
      finalProduct *= multiplicationFactor;
      currentOperationIndex++;
    }
  }

  console.log(finalProduct);
}

const fileSystemModule = require("fs");
const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
calculateProduct(standardInputData);
