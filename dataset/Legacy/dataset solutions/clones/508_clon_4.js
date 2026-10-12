const PerformOperation = (sourceData) => {
  const inputSegments = sourceData.split('\n');

  const calculateRecursiveSum = (segments, currentIdx, accumulatedValue) => {
    if (currentIdx >= segments.length) {
      return accumulatedValue;
    }

    const segmentContent = segments[currentIdx];

    if (segmentContent === "\n") {
      return accumulatedValue;
    }

    const parsedNumeric = parseInt(segmentContent);
    return calculateRecursiveSum(currentIdx + 1, accumulatedValue + parsedNumeric);
  };

  const finalResult = calculateRecursiveSum(inputSegments, 0, 0);
  console.log(finalResult);
};

PerformOperation(require("fs").readFileSync("/dev/stdin", "utf8"));
