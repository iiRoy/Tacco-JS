function entryPoint(rawInputString) {
  const inputTokens = rawInputString.split(" ");

  const calculateAdjustedProduct = (tokenizedValues) => {
    const adjustmentFactor = 2;

    const dimA = parseInt(tokenizedValues[0], 10);
    const dimB = parseInt(tokenizedValues[1], 10);

    const adjustedDimA = dimA - adjustmentFactor;
    const adjustedDimB = dimB - adjustmentFactor;

    const finalResult = adjustedDimA * adjustedDimB;

    console.log(finalResult);
    return;
  };

  calculateAdjustedProduct(inputTokens);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
