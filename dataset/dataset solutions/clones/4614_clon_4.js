const processRawInput = (inputContent) => {
  const segments = inputContent.trim().split('\n');
  const [_valA, configValueStr] = segments[0].split(' ');
  const sequenceData = segments[1].split(' ').map(Number);

  return {
    cap: parseInt(configValueStr, 10),
    dataPoints: sequenceData
  };
};

const determineAccumulatedValue = (processedObject) => {
  const { cap: maxSpan, dataPoints: pointSeries } = processedObject;

  if (pointSeries.length <= 1) {
    return maxSpan;
  }

  const intervalSum = pointSeries.slice(1).reduce((runningSum, currentPoint, idx) => {
    const previousPoint = pointSeries[idx];
    const elapsedTime = currentPoint - previousPoint;
    return runningSum + Math.min(elapsedTime, maxSpan);
  }, 0);

  return intervalSum + maxSpan;
};

const initiateProcess = (sourceText) => {
  const parsedStructure = processRawInput(sourceText);
  const finalResult = determineAccumulatedValue(parsedStructure);
  console.log(finalResult);
};

initiateProcess(require("fs").readFileSync("/dev/stdin", "utf8"));