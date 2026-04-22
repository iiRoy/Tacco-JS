const analyzeStringsForAbSequences = (dataFeed) => {
  const [initialCountLine, ...stringSegments] = dataFeed.split('\n');

  const measureInternalAbClusters = (textUnit) => {
    return textUnit.split('AB').length - 1;
  };

  const aggregatedMetrics = stringSegments.reduce((currentStats, currentSegment) => {
    if (currentSegment.length === 0) {
      return currentStats;
    }

    currentStats.overallAbCount += measureInternalAbClusters(currentSegment);

    const beginsWithB = currentSegment.slice(0, 1) === 'B';
    if (beginsWithB) {
      currentStats.frontBCount++;
    }

    const terminatesWithA = currentSegment.slice(-1) === 'A';
    if (terminatesWithA) {
      currentStats.rearACount++;
    }

    currentStats.containsBtoA = currentStats.containsBtoA || (beginsWithB && terminatesWithA);

    return currentStats;
  }, {
    overallAbCount: 0,
    rearACount: 0,
    frontBCount: 0,
    containsBtoA: false
  });

  let finalResultValue = aggregatedMetrics.overallAbCount;
  const totalAEnds = aggregatedMetrics.rearACount;
  const totalBStarts = aggregatedMetrics.frontBCount;
  const hasMixedEnds = aggregatedMetrics.containsBtoA;

  finalResultValue += Math.min(totalAEnds, totalBStarts);

  if (hasMixedEnds) {
    finalResultValue--;
  }

  return finalResultValue;
};

const processSystemInputAndOutput = (systemInput) => {
  const computedValue = analyzeStringsForAbSequences(systemInput);
  console.log(computedValue);
};

processSystemInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));