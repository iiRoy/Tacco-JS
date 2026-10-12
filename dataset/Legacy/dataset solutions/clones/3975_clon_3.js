const createInputParserFactory = (function () {
  function createParser(sourceString) {
    return new InputSource(sourceString);
  }

  class InputSource {
    constructor(sourceString) {
      this._sourceLines = sourceString.trim().split("\n");
      this._currentLineIndex = 0;
    }

    _parseNumericValue(valueString, returnAsNumber) {
      return returnAsNumber ? +valueString : valueString;
    }

    readNextToken(returnAsNumber = false) {
      let currentLineOrTokens = this._sourceLines[this._currentLineIndex];

      if (typeof currentLineOrTokens === "string") {
        currentLineOrTokens = currentLineOrTokens.split(" ").reverse();
        this._sourceLines[this._currentLineIndex] = currentLineOrTokens;
      }

      const nextToken = currentLineOrTokens.pop();

      if (!currentLineOrTokens.length) {
        this._currentLineIndex++;
      }
      return this._parseNumericValue(nextToken, returnAsNumber);
    }

    readLineTokens(returnAsNumber = false) {
      const lineContent = this._sourceLines[this._currentLineIndex++];
      const tokens = lineContent.split(" ");
      return returnAsNumber ? tokens.map(val => +val) : tokens;
    }

    readMatrix(rowCount, returnAsNumber = false) {
      const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += rowCount);
      const parsedMatrix = matrixRows.map(row => row.split(" "));
      return returnAsNumber ? parsedMatrix.map(row => row.map(val => +val)) : parsedMatrix;
    }

    readRawLines(rowCount, returnAsNumber = false) {
      const rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += rowCount);
      return returnAsNumber ? rawLines.map(val => +val) : rawLines;
    }
  }
  return createParser;
})();

const inputReader = createInputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function findLowerBound(dataArray, startIndex, endIndex, targetValue) {
  let midIndex;
  while (1 < endIndex - startIndex) {
    const midPoint = 0 | (startIndex + endIndex) / 2;
    if (dataArray[midPoint] < targetValue) {
      startIndex = midPoint;
    } else {
      endIndex = midPoint;
    }
  }
  return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

console.log(main());

function main() {
  const elementCount = inputReader.readNextToken(true);
  let arrayA = inputReader.readLineTokens(true);
  let arrayB = inputReader.readLineTokens(true);
  let finalResult = 0;

  const calculateXorSumContribution = (currentElement, sortedArray, count, currentBitValue, doubleBitValue, tripleBitValue) => {
    let currentXorSum = 0;
    const bound2 = findLowerBound(sortedArray, 0, count, doubleBitValue - currentElement);
    const bound1 = findLowerBound(sortedArray, 0, bound2, currentBitValue - currentElement);
    const bound3 = findLowerBound(sortedArray, bound2, count, tripleBitValue - currentElement);
    currentXorSum += -bound3 + bound2 - bound1;
    return currentXorSum;
  };

  for (let bitPosition = 28; bitPosition >= 0; bitPosition--) {
    const currentBitValue = 1 << bitPosition;
    const doubleBitValue = currentBitValue * 2;
    const tripleBitValue = currentBitValue * 3;
    const bitMask = currentBitValue - 1;
    let xorSumCount = elementCount * elementCount;

    arrayB.sort((val1, val2) => val1 - val2);

    for (let idx = 0; idx < elementCount; idx++) {
      xorSumCount += calculateXorSumContribution(arrayA[idx], arrayB, elementCount, currentBitValue, doubleBitValue, tripleBitValue);
    }

    if (xorSumCount % 2) {
      finalResult += currentBitValue;
    }

    arrayB = arrayB.map(val => val & bitMask);
    if (bitPosition < 18) {
      arrayB = filterUniqueElements(arrayB);
    }
    arrayA = arrayA.map(val => val & bitMask);
  }
  return finalResult;

  function filterUniqueElements(inputArray) {
    const seenElementsMap = {};
    for (let idx = 0; idx < inputArray.length; idx++) {
      const currentElement = inputArray[idx];
      if (seenElementsMap[currentElement]) {
        delete seenElementsMap[currentElement];
      } else {
        seenElementsMap[currentElement] = 1;
      }
    }
    return Object.keys(seenElementsMap).map(key => +key);
  }
}
