function determineHighestMagnitude(numericalSequence) {
  return numericalSequence.reduce((runningHigh, itemValue) => Math.max(runningHigh, itemValue), -Infinity);
}

function executeAnalysis(sourceContent) {
  const contentLines = sourceContent.split('\n');

  const [entryQuantityText, groupQuantityText] = contentLines.shift().split(' ');
  const totalEntries = parseInt(entryQuantityText);
  const totalGroups = parseInt(groupQuantityText); // This value is parsed but its direct use is abstracted away in this approach

  const intervalRecords = contentLines.map(row => row.split(' ').map(Number));

  const BOUNDARY_LIMIT = 200002;

  const changeAccumulator = new Array(BOUNDARY_LIMIT).fill(0);

  for (const record of intervalRecords) {
    const initialMoment = record[0];
    const finalMoment = record[1];
    // The third element (category) is implicitly handled by aggregating all changes into a single accumulator

    changeAccumulator[initialMoment * 2 - 1]++;
    changeAccumulator[finalMoment * 2]--;
  }

  const activeCountSeries = new Array(BOUNDARY_LIMIT).fill(0);
  for (let momentIndex = 1; momentIndex < BOUNDARY_LIMIT; momentIndex++) {
    activeCountSeries[momentIndex] = activeCountSeries[momentIndex - 1] + changeAccumulator[momentIndex];
  }

  console.log(determineHighestMagnitude(activeCountSeries));
}

executeAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));