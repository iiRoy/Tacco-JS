function processInput(rawText) {
  const lineSegments = rawText.split('\n');

  const relevantLines = lineSegments.slice(1, lineSegments.length - 1);

  const eateryRecords = relevantLines.reduce((accumulator, currentLine, currentIdx) => {
    const parts = currentLine.split(' ');
    if (parts.length === 2) {
      accumulator.push({
        originalOrder: currentIdx + 1,
        location: parts[0],
        rating: Number(parts[1])
      });
    }
    return accumulator;
  }, []);

  const decoratedRecords = eateryRecords.map(eatery => ({
    ...eatery,
    sortKey: [eatery.location, -eatery.rating]
  }));

  decoratedRecords.sort((firstEatery, secondEatery) => {
    const [locA, scoreValA] = firstEatery.sortKey;
    const [locB, scoreValB] = secondEatery.sortKey;

    if (locA < locB) return -1;
    if (locA > locB) return 1;

    return scoreValA - scoreValB;
  });

  const outputResult = decoratedRecords.map(eatery => eatery.originalOrder).join('\n');
  console.log(outputResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
