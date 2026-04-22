function performAnalysis(entryData) {
  const dataSegments = entryData.trim().split('\n');
  const totalItemCount = parseInt(dataSegments[0], 10);
  const relevantItems = dataSegments.slice(1, totalItemCount + 1);

  const itemTallies = relevantItems.reduce((tallySheet, currentPiece) => {
    tallySheet.set(currentPiece, (tallySheet.get(currentPiece) || 0) + 1);
    return tallySheet;
  }, new Map());

  let peakTally = 0;
  if (itemTallies.size > 0) {
    peakTally = Math.max(...itemTallies.values());
  }

  const topScorers = Array.from(itemTallies.entries())
    .filter(([, score]) => score === peakTally)
    .map(([itemKey]) => itemKey);

  topScorers.sort()
    .forEach(resultItem => console.log(resultItem));
}

performAnalysis(require('fs').readFileSync('./input.txt', 'utf-8'));