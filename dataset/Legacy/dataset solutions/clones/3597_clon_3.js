function InputReader(inputString) {
  this._sourceLines = inputString.split("\n");
  this._currentLineIndex = 0;
}

InputReader.prototype = {
  readAtom: function(asString) {
    let currentLineSegments = this._sourceLines[this._currentLineIndex];
    if (typeof currentLineSegments === "string") {
      currentLineSegments = currentLineSegments.split(" ").reverse();
      this._sourceLines[this._currentLineIndex] = currentLineSegments;
    }

    const extractedValue = currentLineSegments.pop();

    if (currentLineSegments.length === 0) {
      this._currentLineIndex++;
    }

    return asString ? extractedValue : Number(extractedValue);
  },

  readLine: function(asString) {
    const lineContent = this._sourceLines[this._currentLineIndex++];
    const segments = lineContent.split(" ");
    return asString ? segments : segments.map(Number);
  },

  readMultipleLines: function(numLines, asString) {
    const collectedLines = [];
    const startIndex = this._currentLineIndex;
    const endIndex = startIndex + numLines;

    for (let i = startIndex; i < endIndex; i++) {
      const currentLine = this._sourceLines[i];
      const lineSegments = currentLine.split(" ");
      if (asString) {
        collectedLines.push(lineSegments);
      } else {
        collectedLines.push(lineSegments.map(Number));
      }
    }
    this._currentLineIndex = endIndex;
    return collectedLines;
  },
};

function findMedian(numericArray) {
  const sortedArray = [...numericArray].sort((valA, valB) => valA - valB);
  const arrayLength = sortedArray.length;
  const middleIndex = Math.floor(arrayLength / 2);
  return sortedArray[middleIndex];
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputHandler = new InputReader(fileContent);

console.log(executeMainLogic());

function executeMainLogic() {
  const count = inputHandler.readAtom();
  let dataArray = inputHandler.readLine();

  if (count <= 2) {
    const maxValue = Math.max(...dataArray);
    return maxValue;
  }

  const maxPairs = [];
  for (let idx = 0; idx < count - 1; idx++) {
    const currentVal = dataArray[idx];
    const nextVal = dataArray[idx + 1];
    maxPairs.push(Math.max(currentVal, nextVal));
  }

  dataArray = dataArray.concat(maxPairs);

  return findMedian(dataArray);
}
