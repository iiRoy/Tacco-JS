const produceAllCards = () => {
  const cardSuits = ['S', 'H', 'C', 'D'];
  const cardRanks = Array.from({ length: 13 }, (_, idx) => idx + 1);

  return cardSuits.flatMap(currentSuit =>
    cardRanks.map(currentRank => `${currentSuit} ${currentRank}`)
  );
};

const acquireInputLines = () => {
  return require('node:fs').readFileSync('/dev/stdin', 'utf8').split('\n');
};

const displayAndReturn = (itemToLog) => {
  console.log(itemToLog);
  return itemToLog;
};

const presentCardSet = new Set(acquireInputLines());
const completeDeck = produceAllCards();

completeDeck.reduce((accumulator, currentCardIdentifier) => {
  if (!presentCardSet.has(currentCardIdentifier)) {
    displayAndReturn(currentCardIdentifier);
  }
  return accumulator;
}, null);
