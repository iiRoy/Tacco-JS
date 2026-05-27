const processInput = (rawData) => {
  const inputLineParts = rawData[0].split(" ");

  const widthDimension = Number(inputLineParts[0]);
  const heightDimension = Number(inputLineParts[1]);
  const xCoordinate = Number(inputLineParts[2]);
  const yCoordinate = Number(inputLineParts[3]);

  const totalRectangleArea = widthDimension * heightDimension;
  const halfTotalRectangleArea = totalRectangleArea / 2;

  const areaLeftOfX = xCoordinate * heightDimension;
  const areaRightOfX = (widthDimension - xCoordinate) * heightDimension;
  const minVerticalCutArea = Math.min(areaLeftOfX, areaRightOfX);

  const areaAboveY = yCoordinate * widthDimension;
  const areaBelowY = (heightDimension - yCoordinate) * widthDimension;
  const minHorizontalCutArea = Math.min(areaAboveY, areaBelowY);

  let calculatedResultArea;
  let isMultipleChoiceFlag;

  if (minVerticalCutArea === minHorizontalCutArea) {
    if (minHorizontalCutArea === 0) {
      calculatedResultArea = halfTotalRectangleArea;
      isMultipleChoiceFlag = 0;
    } else {
      calculatedResultArea = minHorizontalCutArea;
      isMultipleChoiceFlag = 1;
    }
  } else {
    const maximumOfMinimums = Math.max(minVerticalCutArea, minHorizontalCutArea);
    calculatedResultArea = maximumOfMinimums;

    if (maximumOfMinimums === halfTotalRectangleArea) {
      isMultipleChoiceFlag = 1;
    } else {
      isMultipleChoiceFlag = 0;
    }
  }

  console.log(`${calculatedResultArea} ${isMultipleChoiceFlag}`);
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
