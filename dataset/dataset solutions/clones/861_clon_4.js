const outputFunction = console.log;

const fetchInputData = () => {
  const dataBuffer = require("node:fs").readFileSync(process.stdin.fd, "utf-8");
  return dataBuffer.split("\n").filter(element => element.length > 0);
};

const convertLineToNumbers = (textSegment, separator = " ") =>
  textSegment.split(separator).map(entry => Number.parseInt(entry, 10));

const calculateManhattanProjection = (firstOrdinal, secondOrdinal, gridWidth) => {
  const firstXComponent = firstOrdinal % gridWidth;
  const firstYComponent = Math.floor(firstOrdinal / gridWidth);
  const secondXComponent = secondOrdinal % gridWidth;
  const secondYComponent = Math.floor(secondOrdinal / gridWidth);

  return Math.abs(firstXComponent - secondXComponent) + Math.abs(firstYComponent - secondYComponent);
};

const allInputSegments = fetchInputData();

const maximumDimension = convertLineToNumbers(allInputSegments[0])[0];
const firstPair = convertLineToNumbers(allInputSegments[1]);
const secondPair = convertLineToNumbers(allInputSegments[2]);

const firstValueA = firstPair[0];
const secondValueB = firstPair[1];
const thirdValueC = secondPair[0];
const fourthValueD = secondPair[1];

const potentialGridWidths = Array.from({ length: maximumDimension - 1 }, (_, idx) => idx + 1);

const overallMinimumDistance = potentialGridWidths.reduce((currentMin, currentGridWidth) => {
  const separationOne = calculateManhattanProjection(firstValueA, secondValueB, currentGridWidth);
  const separationTwo = calculateManhattanProjection(thirdValueC, fourthValueD, currentGridWidth);
  const totalSeparation = separationOne + separationTwo;
  return Math.min(currentMin, totalSeparation);
}, Infinity);

outputFunction(overallMinimumDistance);