function processData(rawDataString) {
  const trimmedInputContent = rawDataString.trim();
  const inputLines = trimmedInputContent.split("\n");

  const numericValuesArray = inputLines.map((lineContent) => Number(lineContent));

  const totalDimensionSize = numericValuesArray[0];
  const subgridHeightDimension = numericValuesArray[1];
  const subgridWidthDimension = numericValuesArray[2];

  const availableHeightRange = totalDimensionSize - subgridHeightDimension + 1;
  const availableWidthRange = totalDimensionSize - subgridWidthDimension + 1;

  const finalCalculatedResult = availableHeightRange * availableWidthRange;

  console.log(finalCalculatedResult);
}

const fileSystemUtility = require("fs");
const standardInputBuffer = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
processData(standardInputBuffer);
