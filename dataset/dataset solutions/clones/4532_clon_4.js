const processInputData = (rawTextPayload) => {
  const contentLines = rawTextPayload.split('\n');
  const scoreTokens = contentLines[1].split(' ').filter(token => token.trim() !== '');

  const assignScoreType = (numericScore) => {
    if (numericScore < 0) return null;
    if (numericScore < 400) return 0;
    if (numericScore < 800) return 1;
    if (numericScore < 1200) return 2;
    if (numericScore < 1600) return 3;
    if (numericScore < 2000) return 4;
    if (numericScore < 2400) return 5;
    if (numericScore < 2800) return 6;
    if (numericScore < 3200) return 7;
    if (numericScore <= 4800) return 'extra';
    return null;
  };

  const processedCategories = scoreTokens
    .map(str => parseInt(str, 10))
    .filter(val => !isNaN(val))
    .map(assignScoreType)
    .filter(type => type !== null);

  const distinctColorBadges = new Set();
  let flexibleBadgeCount = 0;

  for (const categoryId of processedCategories) {
    if (categoryId === 'extra') {
      flexibleBadgeCount++;
    } else {
      distinctColorBadges.add(categoryId);
    }
  }

  const baseColorCount = distinctColorBadges.size;
  const minResult = baseColorCount;
  const maxResult = Math.min(8, baseColorCount + flexibleBadgeCount);

  console.log(minResult + ' ' + maxResult);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));