function ExecuteSequenceCalculation(rawData) {
  const processedLines = rawData.trim().split('\n');
  const iterationCount = parseInt(processedLines[0].split(' ')[0], 10);

  const determineIncrement = (precedingValue) => {
    const nextCandidateString = String(precedingValue + 1);
    const numberOfDigits = nextCandidateString.length;
    return Math.pow(10, numberOfDigits - 1);
  };

  const produceSeries = (stepIndex, currentValue) => {
    if (stepIndex >= iterationCount) {
      return;
    }
    console.log(currentValue);
    const nextValue = currentValue + determineIncrement(currentValue);
    produceSeries(stepIndex + 1, nextValue);
  };

  produceSeries(0, 1);
}
ExecuteSequenceCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));