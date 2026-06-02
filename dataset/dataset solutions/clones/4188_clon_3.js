const parseInputCharactersToNumbers = (sourceString) => {
  const characterArray = Array.from(sourceString);
  return characterArray.map(charItem => Number(charItem));
};

const determineMinimumOfProductAndLimit = (valA, valB) => {
  if (valA > valB) {
    return valB;
  } else {
    return valA;
  }
};

function processInputData(rawInputContent) {
  const numericSequence = parseInputCharactersToNumbers(rawInputContent);

  const firstOperand = numericSequence[0];
  const secondOperand = numericSequence[1];
  const computedProduct = firstOperand * secondOperand;

  const comparisonThreshold = numericSequence[2];

  const finalOutputValue = determineMinimumOfProductAndLimit(computedProduct, comparisonThreshold);

  console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
