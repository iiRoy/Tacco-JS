const executeProcessing = (inputDataLines) => {
  const CUBE_DIVISOR = 3;
  const PRECISION_DIGITS = 12;

  const initialDimension = Number(inputDataLines[0]);

  const computeSegmentedCube = (dimensionValue, divisorValue) => {
    const segmentValue = dimensionValue / divisorValue;
    const segmentSquared = segmentValue * segmentValue;
    const cubedResult = segmentSquared * segmentValue;
    return cubedResult;
  };

  const calculatedVolumeLikeValue = computeSegmentedCube(initialDimension, CUBE_DIVISOR);

  console.log(calculatedVolumeLikeValue.toFixed(PRECISION_DIGITS));
};

executeProcessing(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
