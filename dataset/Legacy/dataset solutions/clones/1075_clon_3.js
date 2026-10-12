function swapArrayElements(targetCollection, firstIndex, secondIndex) {
  const temporaryValue = targetCollection[firstIndex];
  targetCollection[firstIndex] = targetCollection[secondIndex];
  targetCollection[secondIndex] = temporaryValue;
}

class PlayingCard {
  constructor(suitIdentifier, numericValue) {
    this.suitIdentifier = String(suitIdentifier);
    this.numericValue = Number(numericValue);
  }

  isIdenticalTo(otherCard) {
    return this.numericValue === otherCard.numericValue && this.suitIdentifier === otherCard.suitIdentifier;
  }

  compareRankWith(otherCard) {
    const currentCardRank = this.numericValue;
    const otherCardRank = otherCard.numericValue;

    if (currentCardRank === otherCardRank) {
      return 0;
    } else if (currentCardRank < otherCardRank) {
      return -1;
    } else {
      return 1;
    }
  }

  getDisplayString() {
    return `${this.suitIdentifier} ${this.numericValue}`;
  }
}

(function executeSortingProcess() {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const inputLines = fileContent.trim().split('\n');

  const numberOfCards = Number(inputLines.shift());

  const rawCardData = inputLines.map(record => record.split(' '));
  const originalCardCollection = rawCardData.map(cardParts => new PlayingCard(cardParts[0], cardParts[1]));

  const quickSortedCollection = originalCardCollection.concat();

  performQuickSort(quickSortedCollection, 0, numberOfCards - 1);

  const sortedForStabilityCheck = originalCardCollection.sort((cardA, cardB) => cardA.compareRankWith(cardB));
  const isSortStable = sortedForStabilityCheck
    .every((cardItem, index) => cardItem.isIdenticalTo(quickSortedCollection[index]));

  let stabilityMessage;
  if (isSortStable) {
    stabilityMessage = 'Stable';
  } else {
    stabilityMessage = 'Not stable';
  }
  console.log(stabilityMessage);

  console.log(quickSortedCollection.map(card => card.getDisplayString()).join('\n'));
})();

function performQuickSort(targetArray, startIndex, endIndex) {
  const partitionArraySegment = function(currentArray, lowIndex, highIndex) {
    let pivotElement = currentArray[highIndex];
    let smallerElementIndex = lowIndex - 1;

    for (let currentElementIndex = lowIndex; currentElementIndex < highIndex; currentElementIndex++) {
      if (currentArray[currentElementIndex].compareRankWith(pivotElement) <= 0) {
        smallerElementIndex++;
        swapArrayElements(currentArray, smallerElementIndex, currentElementIndex);
      }
    }
    swapArrayElements(currentArray, smallerElementIndex + 1, highIndex);
    return smallerElementIndex + 1;
  };

  performQuickSort = function(currentArray, lowIndex, highIndex) {
    if (lowIndex < highIndex) {
      let partitionIndex = partitionArraySegment(currentArray, lowIndex, highIndex);
      performQuickSort(currentArray, lowIndex, partitionIndex - 1);
      performQuickSort(currentArray, partitionIndex + 1, highIndex);
    }
  };

  performQuickSort(targetArray, startIndex, endIndex);
}
