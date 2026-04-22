function processInputAndCompute(dataString) {
  const linesOfData = dataString.split('\n');
  const heightValues = linesOfData[1].split(' ').map(Number);

  const analysisResult = heightValues.reduce(
    (currentAccumulation, currentMeasurement) => {
      if (currentMeasurement >= currentAccumulation.maxObserved) {
        return {
          visibleCount: currentAccumulation.visibleCount + 1,
          maxObserved: currentMeasurement,
        };
      } else {
        return currentAccumulation;
      }
    },
    { visibleCount: 0, maxObserved: 0 }
  );

  return analysisResult.visibleCount;
}

console.log(processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8")));