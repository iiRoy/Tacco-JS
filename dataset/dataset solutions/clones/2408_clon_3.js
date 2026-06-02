function calculateAndDisplayScore(rawInputString) {
  const inputTokens = rawInputString.trim().split(' ');

  const [primaryValue, secondaryValue] = inputTokens.map(Number);

  let cumulativeScore = 0;

  const scoreLookup = new Map([
    [1, 300000],
    [2, 200000],
    [3, 100000]
  ]);

  const primaryBaseScore = scoreLookup.get(primaryValue) || 0;
  const secondaryBaseScore = scoreLookup.get(secondaryValue) || 0;

  cumulativeScore += primaryBaseScore;
  cumulativeScore += secondaryBaseScore;

  const isBothOne = primaryValue === 1 && secondaryValue === 1;
  if (isBothOne) {
    cumulativeScore += 400000;
  }

  console.log(cumulativeScore);
}

calculateAndDisplayScore(require('fs').readFileSync('/dev/stdin', 'utf8'));
