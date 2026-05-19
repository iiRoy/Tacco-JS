'use strict'
const ProcessInput = (rawData) => {
  const trimmedInput = rawData.trim();
  const parsedLines = trimmedInput.split('\n');

  const dimensionsAndCoordinates = parsedLines[0].split(' ').map(Number);
  
  const widthVal = dimensionsAndCoordinates[0];
  const heightVal = dimensionsAndCoordinates[1];
  const coordX = dimensionsAndCoordinates[2];
  const coordY = dimensionsAndCoordinates[3];

  const totalRectangleArea = widthVal * heightVal;
  const areaResult = totalRectangleArea / 2;

  const halfWidth = widthVal / 2;
  const halfHeight = heightVal / 2;
  
  let isCenterFlag = 0;
  const isPointPreciselyCentered = (coordX === halfWidth && coordY === halfHeight);
  
  if (isPointPreciselyCentered) {
    isCenterFlag = 1;
  } 

  console.log(areaResult, isCenterFlag);
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
