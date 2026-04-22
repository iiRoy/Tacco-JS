let accumulatedData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataSegment) => {
  accumulatedData += dataSegment;
});
process.stdin.on('end', () => {
  const allLines = accumulatedData.split('\n');
  const initialParameters = allLines.shift().split(' ').map(Number);

  const vertexCount = initialParameters[0];
  const edgeCountPlaceholder = initialParameters[1]; // Not utilized in the original logic
  const commencementNode = initialParameters[2] - 1;
  const firstGoalNode = initialParameters[3] - 1;
  const secondGoalNode = initialParameters[4] - 1;

  const pathCosts = Array.from({ length: vertexCount }, (_, sourceIndex) =>
    Array.from({ length: vertexCount }, (_, destinationIndex) =>
      sourceIndex === destinationIndex ? 0 : Number.POSITIVE_INFINITY
    )
  );

  allLines.filter(Boolean).forEach(currentLine => {
    if (currentLine === '0 0 0 0 0') return;
    const edgeDetails = currentLine.split(' ').map(Number);
    const origin = edgeDetails[0] - 1;
    const terminus = edgeDetails[1] - 1;
    const cost = edgeDetails[2];
    pathCosts[origin][terminus] = cost;
  });

  Array.from({ length: vertexCount }, (_, pivotVertex) => {
    Array.from({ length: vertexCount }, (_, sourceVertex) => {
      Array.from({ length: vertexCount }, (_, destinationVertex) => {
        const directPath = pathCosts[sourceVertex][destinationVertex];
        const pathViaPivot = pathCosts[sourceVertex][pivotVertex] + pathCosts[pivotVertex][destinationVertex];
        if (directPath > pathViaPivot) {
          pathCosts[sourceVertex][destinationVertex] = pathViaPivot;
        }
      });
    });
  });

  const ultimateMinimum = Array.from({ length: vertexCount }, (_, centralPoint) => {
    const segmentOne = pathCosts[commencementNode][centralPoint];
    const segmentTwo = pathCosts[centralPoint][firstGoalNode];
    const segmentThree = pathCosts[centralPoint][secondGoalNode];
    return segmentOne + segmentTwo + segmentThree;
  }).reduce((currentMin, calculatedSum) => Math.min(currentMin, calculatedSum), Number.POSITIVE_INFINITY);

  console.log(ultimateMinimum);
});