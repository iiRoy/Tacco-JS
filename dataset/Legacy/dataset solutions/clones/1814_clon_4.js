const processNumericalInput = ((sourceText) => {
  const numericPairPattern = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/;
  const extractedSegments = sourceText.match(numericPairPattern);

  const firstValue = Number(extractedSegments ? extractedSegments[1] : undefined);
  const secondValue = Number(extractedSegments ? extractedSegments[2] : undefined);

  const calculatedProduct = firstValue * secondValue;

  console.log(Math.ceil(calculatedProduct));
})(require("fs").readFileSync("/dev/stdin", "utf8"));
