function Main(sourceText) {
  const [firstDimension, secondDimension] = sourceText.match(/-?\d+/g).map(Number);

  const computeAdjustedProduct = (lengthVal, widthVal) => {
    return lengthVal * widthVal - 2 * lengthVal - 2 * widthVal + 4;
  };

  const finalOutcome = computeAdjustedProduct(firstDimension, secondDimension);
  console.log(finalOutcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
