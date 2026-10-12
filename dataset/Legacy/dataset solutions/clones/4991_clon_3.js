function parseNumericValue(lineSegments, index) {
  const valueString = lineSegments[index];
  const parsedInteger = parseInt(valueString, 10);
  return parsedInteger;
}

function ProcessInput(rawData) {
  const parsedLines = rawData.split("\n");

  const totalQuantity = parseNumericValue(parsedLines, 0);
  const initialQuantity = parseNumericValue(parsedLines, 1);
  const initialPrice = parseNumericValue(parsedLines, 2);
  const additionalPrice = parseNumericValue(parsedLines, 3);

  const costForInitialSegment = initialQuantity * initialPrice;
  const remainingQuantity = totalQuantity - initialQuantity;
  const costForAdditionalSegment = remainingQuantity * additionalPrice;
  const finalCalculatedCost = costForInitialSegment + costForAdditionalSegment;
  
  console.log(finalCalculatedCost);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
ProcessInput(fileContent);
