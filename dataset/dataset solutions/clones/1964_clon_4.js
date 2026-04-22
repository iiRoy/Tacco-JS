function performCalculation(sourceContent) {
  const lineBreakPoint = sourceContent.indexOf('\n');
  const firstSegment = sourceContent.substring(0, lineBreakPoint);
  const secondSegment = sourceContent.substring(lineBreakPoint + 1);

  const primaryOperandSource = (firstSegment.match(/\d+/) || [""])[0];
  const primaryOperandValue = parseInt(primaryOperandSource, 10);

  const secondaryOperandsList = (secondSegment.match(/\d+/g) || []).map(Number);

  const sumOfSecondaryElements = secondaryOperandsList.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

  const finalDifferenceResult = primaryOperandValue - sumOfSecondaryElements;

  if (finalDifferenceResult >= 0) {
    console.log(finalDifferenceResult);
  } else {
    console.log(-1);
  }
}

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));