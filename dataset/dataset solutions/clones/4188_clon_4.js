function processInputData(rawData) {
  const numericComponents = rawData.split(/\s+/).filter(Boolean).reduce((accumulator, currentElement, index) => {
    if (index < 3) {
      accumulator.push(parseFloat(currentElement));
    }
    return accumulator;
  }, []);

  const [firstOperand, secondOperand, comparisonThreshold] = numericComponents;

  const computedProduct = firstOperand * secondOperand;

  console.log(Math.min(computedProduct, comparisonThreshold));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
