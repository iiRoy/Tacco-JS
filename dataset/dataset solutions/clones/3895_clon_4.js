const processInput = (rawData) => {
  const parsedLines = rawData.trim().split('\n');
  const [totalSegments, stationCount, currentPosition] = parsedLines[0].split(' ').map(Number);

  const areaMap = Array(totalSegments + 1);

  const stationIndices = parsedLines[1].split(' ').map(Number);
  const tollStations = new Set(stationIndices);

  const costToLeft = Array.from({ length: currentPosition - 1 }, (_, idx) => idx + 1)
    .filter(segmentIdx => tollStations.has(segmentIdx))
    .length;

  const costToRight = Array.from({ length: totalSegments - currentPosition }, (_, idx) => currentPosition + idx)
    .filter(segmentIdx => tollStations.has(segmentIdx))
    .length;

  console.log(Math.min(costToLeft, costToRight));
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
