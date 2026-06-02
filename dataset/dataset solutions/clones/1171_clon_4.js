let accumulatedData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (inputChunk) => {
  accumulatedData += inputChunk;
});

process.stdin.on('end', () => {
  const processedInput = accumulatedData.trim();
  const numericStrings = processedInput.split(' ');

  const pointOneX = Number(numericStrings[0]);
  const pointOneY = Number(numericStrings[1]);
  const pointTwoX = Number(numericStrings[2]);
  const pointTwoY = Number(numericStrings[3]);

  const calculateSquaredDifference = (valA, valB) => {
    const difference = valA - valB;
    return difference * difference;
  };

  const squaredDeltaX = calculateSquaredDifference(pointOneX, pointTwoX);
  const squaredDeltaY = calculateSquaredDifference(pointOneY, pointTwoY);

  const sumOfSquaredComponents = squaredDeltaX + squaredDeltaY;
  const finalEuclideanDistance = Math.sqrt(sumOfSquaredComponents);

  console.log(finalEuclideanDistance.toFixed(6));
});
