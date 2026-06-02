const outputResult = console.log;

const retrieveInputLines = () => {
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf-8");
  return fileContent.split("\n").filter(Boolean);
};

const convertToNumber = (strValue) => Number(strValue);

const parseNumericLine = (lineContent, separator = " ") =>
  lineContent.split(separator).map(convertToNumber);

(() => {
  const inputData = retrieveInputLines();

  const totalSize = convertToNumber(inputData[0]);
  const [startPointA_raw, startPointB_raw] = parseNumericLine(inputData[1]);
  const [endPointC_raw, endPointD_raw] = parseNumericLine(inputData[2]);

  const startPointA = startPointA_raw - 1;
  const startPointB = startPointB_raw - 1;
  const endPointC = endPointC_raw - 1;
  const endPointD = endPointD_raw - 1;

  const computeManhattanGridDistance = (
    firstIndex,
    secondIndex,
    gridDimension
  ) => {
    const firstColumn = firstIndex % gridDimension;
    const firstRow = Math.floor(firstIndex / gridDimension);
    const secondColumn = secondIndex % gridDimension;
    const secondRow = Math.floor(secondIndex / gridDimension);

    return (
      Math.abs(firstColumn - secondColumn) + Math.abs(firstRow - secondRow)
    );
  };

  const minimumCombinedDistance = Array.from(
    { length: totalSize - 1 },
    (_, index) => index + 1
  ).reduce((currentMinimum, currentGridWidth) => {
    const distanceForAB = computeManhattanGridDistance(
      startPointA,
      startPointB,
      currentGridWidth
    );
    const distanceForCD = computeManhattanGridDistance(
      endPointC,
      endPointD,
      currentGridWidth
    );
    const combinedDistance = distanceForAB + distanceForCD;

    return Math.min(currentMinimum, combinedDistance);
  }, totalSize * totalSize);

  outputResult(minimumCombinedDistance);
})();
