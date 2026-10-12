const processInput = (inputData) => {
  const parseInteger = (str) => parseInt(str, 10);
  const trimmedInputContent = inputData.trim();
  const processedLines = trimmedInputContent.split('\n');

  const firstLineSegments = processedLines[0].split(' ');
  const totalPointsCount = parseInteger(firstLineSegments[0]);
  const numCostlyPoints = parseInteger(firstLineSegments[1]);
  const initialPosition = parseInteger(firstLineSegments[2]);

  const costlyPointsArray = processedLines[1].split(' ').map(parseInteger);
  const costlyPointsLookup = new Set(costlyPointsArray);

  let costToLeft = 0;
  const boundaryForLeft = initialPosition - 1;

  for (let currentPoint = boundaryForLeft; currentPoint >= 1; currentPoint--) {
    if (costlyPointsLookup.has(currentPoint)) {
      costToLeft++;
    }
  }

  let costToRight = 0;
  const boundaryForRight = totalPointsCount;

  for (let currentPoint = initialPosition; currentPoint < boundaryForRight; currentPoint++) {
    if (costlyPointsLookup.has(currentPoint)) {
      costToRight++;
    }
  }

  console.log(Math.min(costToLeft, costToRight));
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
