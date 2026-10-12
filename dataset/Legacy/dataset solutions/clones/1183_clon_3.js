let rawDataBuffer = '';
const inputStream = process.stdin;

inputStream.resume();
inputStream.setEncoding('utf-8');

const getAbsoluteDifference = (valA, valB) => Math.abs(valA - valB);

const handleIncomingData = (dataSegment) => {
  rawDataBuffer += dataSegment;
};

const processAndComputeDistances = () => {
  const processedLines = rawDataBuffer.split('\n');
  const elementCount = parseInt(processedLines[0], 10);

  const xStringValues = processedLines[1].split(' ');
  const vectorX = xStringValues.map(Number);

  const yStringValues = processedLines[2].split(' ');
  const vectorY = yStringValues.map(Number);

  let manhattanDistance = 0;
  let squaredEuclideanSum = 0;
  let cubedMinkowskiSum = 0;
  let chebyshevDistance = 0;

  const EXP_SQUARE = 2;
  const EXP_CUBE = 3;
  const EXP_CUBEROOT = 1 / 3;

  for (let idx = 0; idx < elementCount; idx++) {
    const currentDiffAbs = getAbsoluteDifference(vectorX[idx], vectorY[idx]);

    manhattanDistance += currentDiffAbs;

    const diffAbsSquared = Math.pow(currentDiffAbs, EXP_SQUARE);
    const diffAbsCubed = Math.pow(currentDiffAbs, EXP_CUBE);

    squaredEuclideanSum += diffAbsSquared;
    cubedMinkowskiSum += diffAbsCubed;

    chebyshevDistance = Math.max(chebyshevDistance, currentDiffAbs);
  }

  console.log(manhattanDistance);
  console.log(Math.sqrt(squaredEuclideanSum));
  console.log(Math.pow(cubedMinkowskiSum, EXP_CUBEROOT));
  console.log(chebyshevDistance);
};

inputStream.on('data', handleIncomingData);
inputStream.on('end', processAndComputeDistances);
