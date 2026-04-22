function TextStream(rawInput) {
  this._lineSegments = rawInput.split("\n");
  this._currentSegmentIndex = 0;
}

TextStream.prototype = {
  extractToken: function(returnAsString) {
    var lineBuffer = this._lineSegments;
    var segmentPointer = this._currentSegmentIndex;
    var extractedItem;

    if (typeof lineBuffer[segmentPointer] === "string") {
      lineBuffer[segmentPointer] = lineBuffer[segmentPointer].split(" ").reverse();
    }

    extractedItem = lineBuffer[segmentPointer].pop();

    if (!lineBuffer[segmentPointer].length) {
      this._currentSegmentIndex++;
    }
    return returnAsString ? extractedItem : +extractedItem;
  },

  extractLine: function(returnAsString) {
    var lineParts = this._lineSegments[this._currentSegmentIndex++].split(" ");
    return returnAsString ? lineParts : lineParts.map(itemValue => +itemValue);
  },

  extractBlocks: function(blockCount, returnAsString) {
    var lineBuffer = this._lineSegments;
    var segmentPointer = this._currentSegmentIndex;
    var resultBlock = [];
    var idxCounter = 0;

    if (returnAsString) {
      for (; idxCounter < blockCount; idxCounter++) {
        resultBlock[idxCounter] = lineBuffer[segmentPointer + idxCounter].split(" ");
      }
    } else {
      for (; idxCounter < blockCount; idxCounter++) {
        resultBlock[idxCounter] = lineBuffer[segmentPointer + idxCounter].split(" ").map(itemValue => +itemValue);
      }
    }

    this._currentSegmentIndex += blockCount;
    return resultBlock;
  }
};

var dataInput = new TextStream(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processSolution());

function processSolution() {
  var totalCount = dataInput.extractToken();
  var mainValues = dataInput.extractLine();
  var derivedValues = [];

  if (totalCount <= 2) {
    return Math.max(...mainValues);
  }

  for (var idxCounter = 0; idxCounter < totalCount - 1; idxCounter++) {
    derivedValues[idxCounter] = Math.max(mainValues[idxCounter], mainValues[idxCounter + 1]);
  }

  if (totalCount % 4 === 1 || totalCount % 4 === 2) {
    return findCentral(mainValues.concat(derivedValues));
  }

  if (totalCount % 4 === 3) {
    derivedValues.sort((first, second) => first - second);
    mainValues = findCentral(mainValues);
    return findCentral([mainValues, mainValues, derivedValues[totalCount - 1 >> 1], derivedValues[totalCount - 2 >> 1]]);
  }

  mainValues.sort((first, second) => first - second);
  derivedValues = findCentral(derivedValues);
  return findCentral([derivedValues, derivedValues, mainValues[totalCount >> 1], mainValues[totalCount - 1 >> 1]]);


  function findCentral(collection) {
    collection.sort((first, second) => first - second);
    return collection[collection.length >> 1];
  }
}