const ProcessInput = (sourceText) => {
  const lineSegments = sourceText.split('\n') ;
  let totalElements = Number.parseInt(lineSegments[0], 10);
  const numericValues = lineSegments[1].split(' ').map(strVal => Number.parseInt(strVal, 10));

  let runningSum = 0;
  let operationCount = 0;
  const sumHistory = [];

  for (let idx = 0; idx < totalElements; ++idx) {
    runningSum += numericValues[idx];

    if (idx === 0) {
      if (runningSum === 0) {
        if (numericValues[idx + 1] >= 0) {
          runningSum -= (numericValues[idx + 1] - 1);
          if (runningSum === 0) { runningSum--; }
          operationCount += Math.abs(runningSum);
        }
        else {
          runningSum += (Math.abs(numericValues[idx + 1]) - 1);
          if (runningSum === 0) { runningSum++; }
          operationCount += runningSum;
        }
      }
    }
    else {
      if (sumHistory[idx - 1] > 0) {
        if (runningSum >= 0) {
          operationCount += (runningSum + 1);
          runningSum -= (runningSum + 1);
        }
      }
      else {
        if (runningSum <= 0) {
          operationCount += (Math.abs(runningSum) + 1);
          runningSum += (Math.abs(runningSum) + 1);
        }
      }
    }
    sumHistory.push(runningSum);
  }
  console.log(operationCount);
};

ProcessInput( require ('fs').readFileSync ('/dev/stdin', 'utf8' ));