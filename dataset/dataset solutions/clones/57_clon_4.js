(function () {
  let collectedInputBuffer = '';

  function initiateProcessing() {
    const deltaX = parseFloat(collectedInputBuffer[0]);

    console.log(computeAreaApproximation(deltaX));
  }

  function* generateMultipliers(stepValue, limitValue) {
    let currentFactor = 1;
    while (currentFactor * stepValue < limitValue) {
      yield currentFactor;
      currentFactor++;
    }
  }

  function computeAreaApproximation(segmentWidth) {
    const integrationUpperBoundary = 600;

    if (segmentWidth <= 0) {
      // Replicate original behavior: infinite loop for non-positive step sizes
      while (true) {}
    }

    let totalAccumulatedSum = 0;
    for (const currentIterationFactor of generateMultipliers(segmentWidth, integrationUpperBoundary)) {
      const currentPointX = currentIterationFactor * segmentWidth;
      totalAccumulatedSum += (currentPointX * currentPointX);
    }

    return Math.round(totalAccumulatedSum * segmentWidth);
  }

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (dataChunk) {
    collectedInputBuffer += dataChunk;
  });

  process.stdin.on('end', function () {
    collectedInputBuffer = collectedInputBuffer.split('\n');
    initiateProcessing();
  });
}());
