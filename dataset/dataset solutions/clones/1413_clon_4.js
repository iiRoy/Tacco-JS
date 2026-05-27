function processCardData(parsedInputLines) {
  const cardSuits = ['S', 'H', 'C', 'D'];
  const cardRanks = Array.from({ length: 13 }, (_, idx) => idx + 1);

  const initialDeck = new Set(
    cardSuits.flatMap(suitSymbol =>
      cardRanks.map(rankValue => `${suitSymbol} ${rankValue}`)
    )
  );

  parsedInputLines.slice(1).forEach(cardIdentifier => {
    initialDeck.delete(cardIdentifier);
  });

  const cardOrderComparator = (cardA, cardB) => {
    const [suitA, rankAStr] = cardA.split(' ');
    const [suitB, rankBStr] = cardB.split(' ');

    const suitPrecedence = { 'S': 0, 'H': 1, 'C': 2, 'D': 3 };
    const suitComparison = suitPrecedence[suitA] - suitPrecedence[suitB];

    if (suitComparison !== 0) {
      return suitComparison;
    }

    const rankA = parseInt(rankAStr, 10);
    const rankB = parseInt(rankBStr, 10);
    return rankA - rankB;
  };

  Array.from(initialDeck)
    .sort(cardOrderComparator)
    .forEach(unseenCard => {
      console.log(unseenCard);
    });
}

const dataSegments = [];
process.stdin.on('data', function(segment) {
  dataSegments.push(segment);
});
process.stdin.on('end', function() {
  const parsedInputLines = dataSegments.join('').split('\n');
  processCardData(parsedInputLines);
});
