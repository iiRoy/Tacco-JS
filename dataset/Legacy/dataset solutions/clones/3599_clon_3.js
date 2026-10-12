class InputProcessor {
  constructor(inputString) {
    this._sourceLines = inputString.split("\n");
    this._currentLineIndex = 0;
  }

  _ensureCurrentLineIsSplit() {
    if (typeof this._sourceLines[this._currentLineIndex] === "string") {
      this._sourceLines[this._currentLineIndex] = this._sourceLines[this._currentLineIndex].split(" ").reverse();
    }
  }

  readSingleValue(returnAsString = false) {
    this._ensureCurrentLineIsSplit();
    const extractedValue = this._sourceLines[this._currentLineIndex].pop();
    if (!this._sourceLines[this._currentLineIndex].length) {
      this._currentLineIndex++;
    }
    return returnAsString ? extractedValue : Number(extractedValue);
  }

  readValuesOnLine(returnAsString = false) {
    const currentLineContent = this._sourceLines[this._currentLineIndex++];
    const splitValues = currentLineContent.split(" ");
    return returnAsString ? splitValues : splitValues.map(Number);
  }

  readMultiLineValues(numberOfLines, returnAsStrings = false) {
    const resultMatrix = [];
    for (let i = 0; i < numberOfLines; i++) {
      const lineContent = this._sourceLines[this._currentLineIndex + i].split(" ");
      resultMatrix.push(returnAsStrings ? lineContent : lineContent.map(Number));
    }
    this._currentLineIndex += numberOfLines;
    return resultMatrix;
  }
}

function calculateInversionsMergeSort(targetArray) {
  let arraySize = targetArray.length;
  let totalInversions = 0;
  let currentWorkingArray = [...targetArray];

  for (let mergeBlockSize = 1; mergeBlockSize < arraySize; mergeBlockSize <<= 1) {
    let tempMergedArray = new Array(arraySize);
    let currentPosition = 0;

    for (let leftBlockStart = 0; leftBlockStart < arraySize; ) {
      const rightBlockStart = Math.min(arraySize, leftBlockStart + mergeBlockSize);
      const leftBlockEnd = rightBlockStart;
      const rightBlockEnd = Math.min(arraySize, rightBlockStart + mergeBlockSize);

      let leftPointer = leftBlockStart;
      let rightPointer = rightBlockStart;

      while (leftPointer < leftBlockEnd || rightPointer < rightBlockEnd) {
        if (leftPointer === leftBlockEnd) {
          tempMergedArray[currentPosition++] = currentWorkingArray[rightPointer++];
        } else if (rightPointer === rightBlockEnd) {
          tempMergedArray[currentPosition++] = currentWorkingArray[leftPointer++];
        } else if (currentWorkingArray[leftPointer] > currentWorkingArray[rightPointer]) {
          totalInversions += (leftBlockEnd - leftPointer);
          tempMergedArray[currentPosition++] = currentWorkingArray[rightPointer++];
        } else {
          tempMergedArray[currentPosition++] = currentWorkingArray[leftPointer++];
        }
      }
      leftBlockStart = rightBlockEnd;
    }
    currentWorkingArray = tempMergedArray;
  }
  return totalInversions;
}

const dataStreamHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function executeSolution() {
  const inputCount = dataStreamHandler.readSingleValue();
  const inputNumbers = dataStreamHandler.readValuesOnLine();

  if (inputCount <= 2) {
    return Math.max(...inputNumbers);
  }

  const requiredInversionThreshold = Math.floor(inputCount * (inputCount + 1) / 4 + 1);

  let searchLowerBound = 2;
  let searchUpperBound = 1e9 + 1;

  while (searchLowerBound < searchUpperBound) {
    const currentMidpoint = (searchLowerBound + searchUpperBound) >>> 1;

    const transformedPrefixSums = new Array(inputCount + 1);
    transformedPrefixSums[0] = 0;

    for (let i = 0; i < inputCount; i++) {
      const previousSum = transformedPrefixSums[i];
      transformedPrefixSums[i + 1] = previousSum + (inputNumbers[i] < currentMidpoint ? -1 : 1);
    }

    if (calculateInversionsMergeSort(transformedPrefixSums) < requiredInversionThreshold) {
      searchLowerBound = currentMidpoint + 1;
    } else {
      searchUpperBound = currentMidpoint;
    }
  }
  return searchLowerBound - 1;
}

console.log(executeSolution());
