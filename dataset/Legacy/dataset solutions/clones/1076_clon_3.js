class PlayingCard {
  constructor(suitSymbol, rankValue) {
    const stringValue = String(suitSymbol);
    const numericValue = Number(rankValue);
    this.suitSymbol = stringValue;
    this.rankValue = numericValue;
  }

  isSameAs(otherCard) {
    const rankMatches = this.rankValue === otherCard.rankValue;
    const suitMatches = this.suitSymbol === otherCard.suitSymbol;
    return rankMatches && suitMatches;
  }

  compareRankTo(otherCard) {
    if (this.rankValue < otherCard.rankValue) {
      return -1;
    } else if (this.rankValue > otherCard.rankValue) {
      return 1;
    } else {
      return 0;
    }
  }

  toDisplayString() {
    return `${this.suitSymbol} ${this.rankValue}`;
  }
}

function retrieveAndProcessInput(sourcePath) {
  const fileSystemModule = require('fs');
  const rawInputContent = fileSystemModule.readFileSync(sourcePath, 'utf8').trim();
  const contentLinesArray = rawInputContent.split('\n');

  const totalCardCount = Number(contentLinesArray.shift());
  const initialCardCollection = contentLinesArray.map(lineData => {
    const cardComponents = lineData.split(' ');
    return new PlayingCard(cardComponents[0], cardComponents[1]);
  });

  return { totalCardCount, initialCardCollection };
}

function verifySortStability(originalSequence, sortedSequence) {
  const indexedOriginalSequence = originalSequence.map((cardItem, originalPosition) => ({ cardItem, originalPosition }));

  const sortedIndexedSequence = indexedOriginalSequence.sort((itemA, itemB) => {
    const rankComparisonResult = itemA.cardItem.compareRankTo(itemB.cardItem);
    if (rankComparisonResult !== 0) {
      return rankComparisonResult;
    }
    return itemA.originalPosition - itemB.originalPosition;
  });

  const isOrderPreserved = sortedIndexedSequence.every((currentIndexedItem, checkIndex) => {
    return currentIndexedItem.cardItem.isSameAs(sortedSequence[checkIndex]);
  });

  return isOrderPreserved;
}

(function executeProgram() {
  const inputData = retrieveAndProcessInput('/dev/stdin');
  const cardCount = inputData.totalCardCount;
  const originalCards = inputData.initialCardCollection;
  const sortedCards = Array.from(originalCards);

  performQuickSort(sortedCards, 0, cardCount - 1);

  const stabilityCheckResult = verifySortStability(originalCards, sortedCards);

  console.log(stabilityCheckResult ? 'Stable' : 'Not stable');
  console.log(sortedCards.map(card => card.toDisplayString()).join('\n'));
})();

function performQuickSort(cardArray, startIndex, endIndex) {
  const divideAndConquer = function(arrReference, lowIndex, highIndex) {
     const pivotElement = arrReference[highIndex];
     let boundaryIndex = lowIndex - 1;

     for (let currentScanIndex = lowIndex; currentScanIndex < highIndex; currentScanIndex++) {
       if (arrReference[currentScanIndex].compareRankTo(pivotElement) <= 0) {
         boundaryIndex++;
         const temporaryCardHolder = arrReference[boundaryIndex];
         arrReference[boundaryIndex] = arrReference[currentScanIndex];
         arrReference[currentScanIndex] = temporaryCardHolder;
       }
     }

     const temporaryCardHolder = arrReference[boundaryIndex + 1];
     arrReference[boundaryIndex + 1] = arrReference[highIndex];
     arrReference[highIndex] = temporaryCardHolder;

     return boundaryIndex + 1;
  }

  performQuickSort = function(arrReference, lowIndex, highIndex) {
    if (lowIndex < highIndex) {
      const pivotFinalIndex = divideAndConquer(arrReference, lowIndex, highIndex);
      performQuickSort(arrReference, lowIndex, pivotFinalIndex - 1);
      performQuickSort(arrReference, pivotFinalIndex + 1, highIndex);
    }
  }
  performQuickSort(cardArray, startIndex, endIndex);
}
