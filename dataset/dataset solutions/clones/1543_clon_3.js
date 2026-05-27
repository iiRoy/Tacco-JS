const fileSystem = require("fs");

const inputHandler = {
  dataLines: fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n"),
  currentLineIndex: 0,
  totalLines: 0,
  initializeReader: function() {
    this.totalLines = this.dataLines.length;
  },
  fetchNextLine: function() {
    if (!this.hasMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const lineToReturn = this.dataLines[this.currentLineIndex];
    this.currentLineIndex++;
    return lineToReturn;
  },
  hasMoreLines: function() {
    return (this.currentLineIndex < this.totalLines);
  }
};

inputHandler.initializeReader();

function getNextLine() { return inputHandler.fetchNextLine(); }
function getNextInt() { return dataConverter(getNextLine(), 1); }
function getNextStringArray() { return dataConverter(getNextLine(), 2); }
function getNextIntArray() { return dataConverter(getNextLine(), 4); }
function getNextCharArray() { return dataConverter(getNextLine(), 6); }
function hasNextLine() { return inputHandler.hasMoreLines(); }

function printOutput(content) { console.log(content); }
function printError(content) { console.error(content); }

function dataConverter(inputData, conversionType) {
  try {
    if (conversionType === 1) {
      return parseInt(inputData);
    } else if (conversionType === 2) {
      return inputData.split(" ");
    } else if (conversionType === 4) {
      return inputData.split(" ").map((item) => Number(item));
    } else if (conversionType === 6) {
      return inputData.split("");
    } else if (conversionType === 7) {
      return inputData.split("").map((item) => Number(item));
    } else if (conversionType === 8) {
      return inputData.join(" ");
    } else if (conversionType === 9) {
      return inputData.join("\n");
    } else if (conversionType === 0) {
      return inputData.join("");
    } else {
      return inputData;
    }
  } catch (error) {
    return inputData;
  }
}

class DisjointSet {
  parentOrSize;

  constructor(numberOfElements) {
    this.parentOrSize = new Array(numberOfElements).fill(-1);
  }

  findRepresentative(elementIndex) {
    if (this.parentOrSize[elementIndex] < 0) {
      return elementIndex;
    } else {
      this.parentOrSize[elementIndex] = this.findRepresentative(this.parentOrSize[elementIndex]);
      return this.parentOrSize[elementIndex];
    }
  }

  areConnected(elementA, elementB) {
    return this.findRepresentative(elementA) === this.findRepresentative(elementB);
  }

  uniteSets(elementA, elementB) {
    let rootA = this.findRepresentative(elementA);
    let rootB = this.findRepresentative(elementB);

    if (rootA !== rootB) {
      if (rootA >= rootB) {
        this.parentOrSize[rootA] += this.parentOrSize[rootB];
        this.parentOrSize[rootB] = rootA;
      } else {
        this.parentOrSize[rootB] += this.parentOrSize[rootA];
        this.parentOrSize[rootA] = rootB;
      }
    }
  }

  getGroupSize(elementIndex) {
    return -this.parentOrSize[this.findRepresentative(elementIndex)];
  }
}

function executeSolution() {
  const firstLineData = getNextIntArray();
  const N = firstLineData[0];
  const Q = firstLineData[1];

  const dsStructure = new DisjointSet(N);

  const resultBuffer = [];

  const processSingleQuery = (queryData) => {
    const queryType = queryData[0];
    const val1 = queryData[1];
    const val2 = queryData[2];

    if (queryType === 0) {
      dsStructure.uniteSets(val1, val2);
    } else {
      if (dsStructure.areConnected(val1, val2)) {
        resultBuffer.push("Yes");
      } else {
        resultBuffer.push("No");
      }
    }
  };

  for (let i = 0; i < Q; i++) {
    const currentQuery = getNextIntArray();
    processSingleQuery(currentQuery);
  }

  printOutput(dataConverter(resultBuffer, 9));
}

executeSolution();
