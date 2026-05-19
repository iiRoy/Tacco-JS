function processCoordinates(inputDataString) {
  const coordinateLine = inputDataString.split('\n')[0];
  const coordinateTokens = coordinateLine.split(' ');

  const initialX1 = Number(coordinateTokens[0]);
  const initialY1 = Number(coordinateTokens[1]);
  const initialX2 = Number(coordinateTokens[2]);
  const initialY2 = Number(coordinateTokens[3]);

  const yDifference = initialY2 - initialY1;
  const xDifference = initialX2 - initialX1;

  const thirdPointX = initialX2 - yDifference;
  const thirdPointY = initialY2 + xDifference;

  const fourthPointX = initialX1 - yDifference;
  const fourthPointY = initialY1 + xDifference;

  const finalOutputString = `${thirdPointX} ${thirdPointY} ${fourthPointX} ${fourthPointY}`;

  console.log('%s', finalOutputString);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processCoordinates(fileContent);
