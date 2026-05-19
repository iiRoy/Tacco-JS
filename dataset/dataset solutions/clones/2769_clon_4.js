function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const numElements = parseInt(inputLines[0], 10);

  const valleyElements = inputLines[1].split(" ").map(Number);

  const initialPeakValue = valleyElements.reduce((accumulator, currentValue, index) => {
    return accumulator + (index % 2 === 0 ? currentValue : -currentValue);
  }, 0);

  let priorPeakValue = initialPeakValue;
  const mountainPeaks = valleyElements.map((_, index) => {
    if (index === 0) {
      return initialPeakValue;
    }
    const currentPeak = (2 * valleyElements[index - 1]) - priorPeakValue;
    priorPeakValue = currentPeak;
    return currentPeak;
  });

  console.log(`${mountainPeaks.join(' ')}\n`);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
