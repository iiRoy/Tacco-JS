class PlayingPiece {
  constructor(symbol, rankValue) {
    this.symbol = String(symbol);
    this.rank = Number(rankValue);
  }

  isIdentical(anotherPiece) { return this.rank === anotherPiece.rank && this.symbol === anotherPiece.symbol; }

  compareRanks(anotherItem) {
    if (this.rank === anotherItem.rank) return 0;
    else if (this.rank < anotherItem.rank) return -1;
    else return 1;
  }

  representAsText() { return `${this.symbol} ${this.rank}`; }
}

(function startup() {
  const inputDataLines = require('fs').readFileSync('/dev/fd/0', 'utf8').trim().split('\n');
  const itemCount = Number(inputDataLines.shift());
  const originalItems = inputDataLines.map(lineEntry => lineEntry.split(' ')).map(pieceData => new PlayingPiece(pieceData[0], pieceData[1]));
  const sortableItems = Array.from(originalItems);

  performFastSort(sortableItems, 0, itemCount - 1);
  console.log(originalItems.map((element, indexVal) => ({elementValue: element, originalIndex: indexVal}))
      .sort((first, second) => first.elementValue.compareRanks(second.elementValue) || first.originalIndex - second.originalIndex)
      .every((currentPiece, loopIndex) => currentPiece.elementValue.isIdentical(sortableItems[loopIndex]))
          ? 'Order Preserved' : 'Order Not Preserved'
        );
  console.log(sortableItems.join('\n'));
})();

function performFastSort(dataArray, startIndex, endIndex) {
  const divideAndConquer = function(inputCollection, currentStart, currentEnd) {
     let pivotElement = inputCollection[currentEnd];
     let leftPointer = currentStart - 1;
     for (let rightIterator = currentStart; rightIterator < currentEnd; rightIterator++) {
       if (inputCollection[rightIterator].compareRanks(pivotElement) <= 0) {
         leftPointer++;
         [inputCollection[leftPointer], inputCollection[rightIterator]] = [inputCollection[rightIterator], inputCollection[leftPointer]];
       }
     }
     [inputCollection[leftPointer + 1], inputCollection[currentEnd]] = [inputCollection[currentEnd], inputCollection[leftPointer + 1]];
     return leftPointer + 1;
  };

  performFastSort = function(inputCollection, currentStart, currentEnd) {
    if (currentStart < currentEnd) {
      let pivotIndex = divideAndConquer(inputCollection, currentStart, currentEnd);
      performFastSort(inputCollection, currentStart, pivotIndex - 1);
      performFastSort(inputCollection, pivotIndex + 1, currentEnd);
    }
  };
  performFastSort(dataArray, startIndex, endIndex);
}