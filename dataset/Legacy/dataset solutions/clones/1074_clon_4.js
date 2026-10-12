const createPlayingCard = (symbolIdentifier, numericRank) => ({
  symbol: String(symbolIdentifier),
  rank: Number(numericRank)
});

const comparePlayingCards = (firstCard, secondCard) => {
  if (firstCard.rank === secondCard.rank) return 0;
  return firstCard.rank < secondCard.rank ? -1 : 1;
};

const arePlayingCardsIdentical = (cardOne, cardTwo) => {
  return cardOne.rank === cardTwo.rank && cardOne.symbol === cardTwo.symbol;
};

const displayPlayingCard = (cardObject) => `${cardObject.symbol} ${cardObject.rank}`;

const partitionCards = (cardCollection, lowerBound, upperBound) => {
  const pivotCard = cardCollection[upperBound];
  let boundaryPointer = lowerBound - 1;

  for (let currentPointer = lowerBound; currentPointer < upperBound; currentPointer++) {
    if (comparePlayingCards(cardCollection[currentPointer], pivotCard) <= 0) {
      boundaryPointer++;
      [cardCollection[boundaryPointer], cardCollection[currentPointer]] = [cardCollection[currentPointer], cardCollection[boundaryPointer]];
    }
  }
  [cardCollection[boundaryPointer + 1], cardCollection[upperBound]] = [cardCollection[upperBound], cardCollection[boundaryPointer + 1]];
  return boundaryPointer + 1;
};

const performIterativeQuickSort = (cardCollection, initialLow, initialHigh) => {
  const rangeStack = [];
  rangeStack.push([initialLow, initialHigh]);

  while (rangeStack.length > 0) {
    const [currentLow, currentHigh] = rangeStack.pop();

    if (currentLow < currentHigh) {
      const pivotIndex = partitionCards(cardCollection, currentLow, currentHigh);

      rangeStack.push([pivotIndex + 1, currentHigh]);
      rangeStack.push([currentLow, pivotIndex - 1]);
    }
  }
};

(function executeCardSortingProgram() {
  const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalCardCount = Number(inputDataLines.shift());
  const initialCardSet = inputDataLines.map(lineSegment => lineSegment.split(' ')).map(cardParts => createPlayingCard(cardParts[0], cardParts[1]));

  const quickSortedCardSet = Array.from(initialCardSet);

  performIterativeQuickSort(quickSortedCardSet, 0, totalCardCount - 1);

  const stableSortedCardSet = initialCardSet
    .map((cardElement, originalPosition) => ({ cardValue: cardElement, initialPosition: originalPosition }))
    .sort((cardAWrapper, cardBWrapper) =>
      comparePlayingCards(cardAWrapper.cardValue, cardBWrapper.cardValue) ||
      cardAWrapper.initialPosition - cardBWrapper.initialPosition
    );

  const isSortStable = stableSortedCardSet.every((wrappedCard, index) =>
    arePlayingCardsIdentical(wrappedCard.cardValue, quickSortedCardSet[index])
  );

  console.log(isSortStable ? 'Stable' : 'Not stable');
  console.log(quickSortedCardSet.map(displayPlayingCard).join('\n'));
})();
