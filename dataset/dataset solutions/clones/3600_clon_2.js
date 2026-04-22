function InputReader(inputString) {
  this._lines = inputString.split("\n");
  this._currentLineIndex = 0;
}

InputReader.prototype = {
  readElement: function(returnAsString) {
    let linesArray = this._lines;
    let lineIndex = this._currentLineIndex;
    let resultElement;

    if (typeof linesArray[lineIndex] === "string") {
      linesArray[lineIndex] = linesArray[lineIndex].split(" ").reverse();
    }

    resultElement = linesArray[lineIndex].pop();

    if (!linesArray[lineIndex].length) {
      this._currentLineIndex++;
    }

    return returnAsString ? resultElement : +resultElement;
  },

  readLine: function(returnAsString) {
    let currentLineParts = this._lines[this._currentLineIndex++].split(" ");
    return returnAsString ? currentLineParts : currentLineParts.map(item => +item);
  },

  readLines: function(numLines, returnAsString) {
    let dataLines = this._lines;
    let initialIndex = this._currentLineIndex;
    let readData = [];
    let counter = 0;

    if (returnAsString) {
      for (; counter < numLines; counter++) {
        readData[counter] = dataLines[initialIndex + counter].split(" ");
      }
    } else {
      for (; counter < numLines; counter++) {
        readData[counter] = dataLines[initialIndex + counter].split(" ").map(parsedVal => +parsedVal);
      }
    }

    this._currentLineIndex += numLines;
    return readData;
  },
};

let readerInstance = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function BinaryIndexedTree(treeSize) {
  this._treeArray = Array(treeSize).fill(0);
}

BinaryIndexedTree.prototype = {
  updateValue: function(index, valueToAdd) {
    for (; index < this._treeArray.length; index += index & -index) {
      this._treeArray[index] += valueToAdd;
    }
  },

  querySum: function(upToIndex) {
    let currentSum = 0;
    for (; upToIndex > 0; upToIndex -= upToIndex & -upToIndex) {
      currentSum += this._treeArray[upToIndex];
    }
    return currentSum;
  },
};

function calculateMedianPermutation() {
  let arraySize = readerInstance.readElement();
  let inputNumbers = readerInstance.readLine();

  if (arraySize <= 2) {
    return Math.max(...inputNumbers);
  }

  let targetRank = Math.floor(arraySize * (arraySize + 1) / 4 + 1);
  let lowerBound = 2;
  let upperBound = 1000000001;

  while (lowerBound < upperBound) {
    let midValue = lowerBound + upperBound >> 1;
    let balanceCounter = arraySize + 1;
    let smallerPairsCount = 0;
    let bitInstance = new BinaryIndexedTree(balanceCounter * 2);

    bitInstance.updateValue(balanceCounter, 1);

    for (let idx = 0; idx < arraySize; idx++) {
      if (inputNumbers[idx] < midValue) {
        balanceCounter--;
      } else {
        balanceCounter++;
      }
      smallerPairsCount += bitInstance.querySum(balanceCounter);
      bitInstance.updateValue(balanceCounter, 1);
    }

    smallerPairsCount = arraySize * (arraySize + 1) / 2 - smallerPairsCount;

    if (smallerPairsCount < targetRank) {
      lowerBound = midValue + 1;
    } else {
      upperBound = midValue;
    }
  }
  return lowerBound - 1;
}

console.log(calculateMedianPermutation());