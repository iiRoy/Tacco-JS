function measureNumericLength(val) {
  if (val === 0) {
    return 1;
  }
  return Math.floor(Math.log10(val)) + 1;
}

function trampoline(continuation) {
  return function(...args) {
    let currentResult = continuation(...args);
    while (typeof currentResult === 'function') {
      currentResult = currentResult();
    }
    return currentResult;
  };
}

function discoverMinimalExtent(targetNumber, currentCandidate, upperLimit, currentMinimumExtent) {
  if (currentCandidate > upperLimit) {
    return currentMinimumExtent;
  }

  let updatedMinimum = currentMinimumExtent;

  if (targetNumber % currentCandidate === 0) {
    const complementFactor = targetNumber / currentCandidate;
    const candidateLength = measureNumericLength(currentCandidate);
    const complementLength = measureNumericLength(complementFactor);
    const maximumPairLength = Math.max(candidateLength, complementLength);
    updatedMinimum = Math.min(currentMinimumExtent, maximumPairLength);
  }

  return () => discoverMinimalExtent(targetNumber, currentCandidate + 1, upperLimit, updatedMinimum);
}

function analyzeInputAndCompute(incomingValue) {
  const numericalData = Number(incomingValue);

  const initialSpan = measureNumericLength(numericalData);
  const searchBound = Math.floor(Math.sqrt(numericalData));

  const finalSpan = trampoline(discoverMinimalExtent)(numericalData, 1, searchBound, initialSpan);

  console.log('%s', finalSpan);
}

analyzeInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));