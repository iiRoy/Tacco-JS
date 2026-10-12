const createPlayingCard = (cardMark, cardValue) => ({
  symbol: String(cardMark),
  numericVal: Number(cardValue)
});

const areCardsIdentical = (firstCard, secondCard) => {
  return firstCard.numericVal === secondCard.numericVal && firstCard.symbol === secondCard.symbol;
};

const compareCardNumericValues = (cardA, cardB) => {
  if (cardA.numericVal === cardB.numericVal) return 0;
  return cardA.numericVal < cardB.numericVal ? -1 : 1;
};

const formatCardOutput = (cardItem) => {
  return `${cardItem.symbol} ${cardItem.numericVal}`;
};

const combineSortedSegments = (leftSegment, rightSegment) => {
  let mergedCollection = [];
  let leftPointer = 0;
  let rightPointer = 0;

  while (leftPointer < leftSegment.length && rightPointer < rightSegment.length) {
    if (compareCardNumericValues(leftSegment[leftPointer], rightSegment[rightPointer]) <= 0) {
      mergedCollection.push(leftSegment[leftPointer]);
      leftPointer++;
    } else {
      mergedCollection.push(rightSegment[rightPointer]);
      rightPointer++;
    }
  }

  return mergedCollection.concat(leftSegment.slice(leftPointer)).concat(rightSegment.slice(rightPointer));
};

const performMergeSort = (dataCollection) => {
  if (dataCollection.length <= 1) {
    return dataCollection;
  }

  const middleIndex = Math.floor(dataCollection.length / 2);
  const leftSubarray = dataCollection.slice(0, middleIndex);
  const rightSubarray = dataCollection.slice(middleIndex);

  const sortedLeft = performMergeSort(leftSubarray);
  const sortedRight = performMergeSort(rightSubarray);

  return combineSortedSegments(sortedLeft, sortedRight);
};

(function processInputAndSort() {
  const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalCardCount = Number(inputDataLines.shift());
  const initialCardList = inputDataLines.map(entry => entry.split(' ')).map(parts => createPlayingCard(parts[0], parts[1]));

  const mergeSortedResult = performMergeSort([...initialCardList]);

  const standardSortedList = [...initialCardList].sort((itemA, itemB) => compareCardNumericValues(itemA, itemB));

  const isSortingStable = standardSortedList.every((cardEntry, index) => areCardsIdentical(cardEntry, mergeSortedResult[index]));

  console.log(isSortingStable ? 'Stable' : 'Not stable');
  console.log(mergeSortedResult.map(formatCardOutput).join('\n'));
})();
