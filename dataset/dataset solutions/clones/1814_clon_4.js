function handleIncomingData(sourceText) {
  const numberPattern = /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/;
  const extractedSegments = sourceText.match(numberPattern);

  const primaryValue = Number(extractedSegments[1]);
  const secondaryValue = Number(extractedSegments[2]);

  const operandCollection = [primaryValue, secondaryValue];
  const combinedProduct = operandCollection.reduce((accumulator, currentElement) => accumulator * currentElement, 1);

  function adjustToNextInteger(valueToAdjust) {
    const integerComponent = parseInt(valueToAdjust);
    return (valueToAdjust > integerComponent && valueToAdjust !== integerComponent) ? integerComponent + 1 : integerComponent;
  }

  const finalOutcome = adjustToNextInteger(combinedProduct);

  console.log(finalOutcome);
}

handleIncomingData(require("fs").readFileSync("/dev/stdin", "utf8"));