const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputHandlerInstance;
const collectedInputLines = [];

inputReader.on('line', (currentLine) => {
  collectedInputLines.push(currentLine);
});

inputReader.on('close', () => {
  inputHandlerInstance = initializeInputHandler(collectedInputLines);
  console.error('\n↑入力 ↓出力');
  processInputAndSolve();
});

const deepClone = (dataToClone) => (dataToClone instanceof Set) ? new Set(Array.from(dataToClone)) : JSON.parse(JSON.stringify(dataToClone));

const readNextInt = () => convertInput(getNextLine(), 1);
const readNextStrArray = () => convertInput(getNextLine(), 2);
const readNextIntArray = () => convertInput(getNextLine(), 4);
const readNextCharArray = () => convertInput(getNextLine(), 6);

const getNextLine = () => inputHandlerInstance.next();
const hasMoreLines = () => inputHandlerInstance.hasNext();

const initializeInputHandler = (linesArray) => {
  return {
    lineList: linesArray,
    currentIndex: 0,
    maxIndex: linesArray.length,
    hasNext: function() { return (this.currentIndex < this.maxIndex); },
    next: function() {
      if (this.hasNext()) {
        return this.lineList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
};

const printOutput = (message) => console.log(message);
const printDebug = (debugMessage) => console.error('debug:' + require('util').inspect(debugMessage, false, null));

const convertInput = (inputValue, conversionType) => {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
};

function processInputAndSolve() {
  const firstLineData = readNextIntArray();
  const numNodes = firstLineData[0];
  const numKRelations = firstLineData[1];
  const numLRelations = firstLineData[2];

  const unionFindK = createUnionFind(numNodes);
  const unionFindL = createUnionFind(numNodes);

  const processPairAndUnion = (ufInstance) => {
    const currentPair = readNextIntArray();
    currentPair.sort();
    const nodeA = currentPair[0] - 1;
    const nodeB = currentPair[1] - 1;
    ufInstance.performUnion(nodeA, nodeB);
  };

  for (let i = 0; i < numKRelations; i++) {
    processPairAndUnion(unionFindK);
  }

  for (let i = 0; i < numLRelations; i++) {
    processPairAndUnion(unionFindL);
  }

  const rootCountMap = {};
  for (let i = 0; i < numNodes; i++) {
    const rootK = unionFindK.findRootIndex(i);
    const rootL = unionFindL.findRootIndex(i);
    const combinedRootKey = `${rootL}:${rootK}`;
    
    rootCountMap[combinedRootKey] = (rootCountMap[combinedRootKey] || 0) + 1;
  }

  const resultCounts = new Array(numNodes);
  for (let i = 0; i < numNodes; i++) {
    const rootK = unionFindK.findRootIndex(i);
    const rootL = unionFindL.findRootIndex(i);
    const combinedRootKey = `${rootL}:${rootK}`;
    resultCounts[i] = rootCountMap[combinedRootKey];
  }

  printOutput(convertInput(resultCounts, 8));
}

function createUnionFind(size) {
  const parentOrSizeArray = new Array(size).fill(-1);

  const unionFindInstance = {
    isSameSet: function(idxA, idxB) {
      return this.findRootIndex(idxA) === this.findRootIndex(idxB);
    },

    findRootIndex: function(elementIndex) {
      if (parentOrSizeArray[elementIndex] < 0) {
        return elementIndex;
      } else {
        parentOrSizeArray[elementIndex] = this.findRootIndex(parentOrSizeArray[elementIndex]);
        return parentOrSizeArray[elementIndex];
      }
    },

    performUnion: function(idxA, idxB) {
      let rootA = this.findRootIndex(idxA);
      let rootB = this.findRootIndex(idxB);

      if (rootA !== rootB) {
        if (parentOrSizeArray[rootA] <= parentOrSizeArray[rootB]) {
          parentOrSizeArray[rootA] += parentOrSizeArray[rootB];
          parentOrSizeArray[rootB] = rootA;
        } else {
          parentOrSizeArray[rootB] += parentOrSizeArray[rootA];
          parentOrSizeArray[rootA] = rootB;
        }
      }
    },

    getSetSize: function(elementIndex) {
      return -parentOrSizeArray[this.findRootIndex(elementIndex)];
    }
  };
  return unionFindInstance;
}
