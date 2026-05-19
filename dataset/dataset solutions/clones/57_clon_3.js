(function () {
  let rawDataBuffer = '';
  const INTEGRAL_UPPER_LIMIT = 600;

  function processAndExecute () {
    let parsedInputLines;
    let stepSize;

    parsedInputLines = rawDataBuffer.split('\n');
    stepSize = parseFloat(parsedInputLines[0]);

    const finalResult = calculateRiemannSum(stepSize, INTEGRAL_UPPER_LIMIT);
    console.log(finalResult);
  }

  function calculateRiemannSum(stepSizeParam, upperBoundary) {
    let iterationIndex;
    let currentAccumulatedSum = 0;

    for (iterationIndex = 1; ; iterationIndex += 1) {
      const currentYValue = iterationIndex * stepSizeParam;

      if (currentYValue >= upperBoundary) {
        break;
      }

      const termValue = currentYValue * currentYValue * stepSizeParam;
      currentAccumulatedSum += termValue;
    }

    return Math.round(currentAccumulatedSum);
  }

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (dataChunk) {
    rawDataBuffer += dataChunk;
  });

  process.stdin.on('end', function () {
    processAndExecute();
  });
}());
