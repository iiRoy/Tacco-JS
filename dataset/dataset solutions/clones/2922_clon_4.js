const obtainSourceData = () => {
  const allLines = require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
  const linePointer = { current: 0 };

  const retrieveNumericDatum = () => parseInt(allLines[linePointer.current++]);
  const retrieveNumericArray = () => allLines[linePointer.current++].split(' ').map(Number);

  return {
    itemCount: retrieveNumericDatum(),
    numericSequence: retrieveNumericArray()
  };
};

const calculateMaxSegmentSum = (dataSeries) => {
  return dataSeries.reduce((accum, currentVal) => {
    const newSum = accum.currentAccumulation + currentVal;
    return {
      peakValue: Math.max(accum.peakValue, newSum),
      currentAccumulation: newSum
    };
  }, { peakValue: 0, currentAccumulation: 0 }).peakValue;
};

const orchestrateComputation = () => {
  const { itemCount: totalCount, numericSequence: sourceValues } = obtainSourceData();

  const symmetricPairSums = Array.from({ length: Math.floor(totalCount / 2) }, (_, index) => {
    return sourceValues[index] + sourceValues[totalCount - 1 - index];
  });

  let overallMaximum = 0;
  const highestStrideBoundary = Math.floor(totalCount / 2) - 1;

  for (let currentStride = 1; currentStride < highestStrideBoundary; ++currentStride) {
    const sampledSubsequence = Array.from({ length: Math.ceil(symmetricPairSums.length / currentStride) }, (_, subIndex) => {
      return symmetricPairSums[subIndex * currentStride];
    });
    overallMaximum = Math.max(overallMaximum, calculateMaxSegmentSum(sampledSubsequence));
  }

  return overallMaximum;
};

const displayOutput = (finalResult) => {
  console.log(finalResult);
};

displayOutput(orchestrateComputation());