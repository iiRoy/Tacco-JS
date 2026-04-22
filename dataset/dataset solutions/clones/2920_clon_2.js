var InputParser = (function() {
  function createReader(inputString) {
    return new DataReader(inputString);
  }

  function DataReader(inputString) {
    this._lines = inputString.trim().split("\n");
    this._lineIndex = 0;
  }

  DataReader.prototype.readNextValue = function(asString) {
    let currentLines = this._lines;
    let currentIndex = this._lineIndex;
    let resultValue;

    if (typeof currentLines[currentIndex] === "string") {
      currentLines[currentIndex] = currentLines[currentIndex].split(" ").reverse();
    }

    resultValue = currentLines[currentIndex].pop();

    if (!currentLines[currentIndex].length) {
      this._lineIndex++;
    }

    return asString ? resultValue : +resultValue;
  };

  DataReader.prototype.readNextLine = function(asString) {
    let lineContent = this._lines[this._lineIndex++].split(" ");
    return asString ? lineContent : lineContent.map(item => +item);
  };

  DataReader.prototype.readMatrix = function(rowCount, asString) {
    let matrixRows = this._lines.slice(this._lineIndex, this._lineIndex += rowCount).map(item => item.split(" "));
    return asString ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  DataReader.prototype.readRows = function(rowCount, asString) {
    let rowsData = this._lines.slice(this._lineIndex, this._lineIndex += rowCount);
    return asString ? rowsData : rowsData.map(item => +item);
  };

  return createReader;
})();

var fileSystemModule = require("node:fs");
var dataStream = InputParser(fileSystemModule.readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
  let dimensions = arguments;
  let dimCount = dimensions.length;
  let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(_ => {return ${initialValue};})`;
  while (--dimCount) {
    arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(_ => ${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}

function findLowerBoundIndex(dataArray, startIndex, endIndex, targetValue) {
  let midIndex;
  for (; 1 < endIndex - startIndex;) {
    midIndex = Math.floor((startIndex + endIndex) / 2);
    if (dataArray[midIndex] < targetValue) {
      startIndex = midIndex;
    } else {
      endIndex = midIndex;
    }
  }
  return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

function SegmentTree(initialSize) {
  let tempSize = initialSize - 1;
  let treeArraySize = 2;

  while (tempSize) {
    tempSize >>= 1;
    treeArraySize <<= 1;
  }
  this.treeNodes = Array(treeArraySize - 1).fill(Infinity);
  this.leafOffset = treeArraySize >> 1;
}

SegmentTree.prototype = {
  queryMin: function(targetIndex) {
    targetIndex += this.leafOffset - 1;
    let currentMin = Infinity;

    while (targetIndex >= 0) {
      if (this.treeNodes[targetIndex] < currentMin) {
        currentMin = this.treeNodes[targetIndex];
      }
      targetIndex = (targetIndex - 1) >> 1;
    }
    if (currentMin === Infinity) {
      currentMin = -1;
    }
    return currentMin;
  },

  rangeUpdate: function(updateStart, updateEnd, newValue) {
    const nodesRef = this.treeNodes;
    const offsetRef = this.leafOffset;

    function recursiveUpdate(currentL, currentR, nodeL, nodeR, nodeIndex) {
      if (currentL === nodeL && currentR === nodeR) {
        nodesRef[nodeIndex] = newValue;
        return;
      }
      const midPoint = (nodeL + nodeR) >> 1;
      if (midPoint < currentR) {
        if (currentL < midPoint) {
          recursiveUpdate(currentL, midPoint, nodeL, midPoint, nodeIndex * 2 + 1);
          recursiveUpdate(midPoint, currentR, midPoint, nodeR, nodeIndex * 2 + 2);
        } else {
          recursiveUpdate(currentL, currentR, midPoint, nodeR, nodeIndex * 2 + 2);
        }
      } else {
        recursiveUpdate(currentL, currentR, nodeL, midPoint, nodeIndex * 2 + 1);
      }
    }
    recursiveUpdate(updateStart, updateEnd, 0, offsetRef, 0);
  },
};

console.log(executeMainLogic());

function executeMainLogic() {
  const numItems = dataStream.readNextValue();
  const numQueries = dataStream.readNextValue();
  const itemData = dataStream.readMatrix(numItems);
  const queryPoints = dataStream.readRows(numQueries);

  const segmentTreeInstance = new SegmentTree(numQueries);

  itemData.sort((itemA, itemB) => itemB[2] - itemA[2]);

  for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
    if (itemData[itemIdx][1] - itemData[itemIdx][2] - 1 < queryPoints[0]) {
      continue;
    }

    const leftBound = findLowerBoundIndex(queryPoints, 0, numQueries, itemData[itemIdx][0] - itemData[itemIdx][2]);
    const rightBound = findLowerBoundIndex(queryPoints, leftBound, numQueries, itemData[itemIdx][1] - itemData[itemIdx][2]);

    segmentTreeInstance.rangeUpdate(leftBound, rightBound, itemData[itemIdx][2]);
  }

  const finalResults = Array(numQueries);
  for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    finalResults[queryIdx] = segmentTreeInstance.queryMin(queryIdx);
  }

  return finalResults.join("\n");
}